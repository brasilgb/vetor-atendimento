import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SignatureView, { SignatureViewRef } from 'react-native-signature-canvas';

import { AppShell } from '@/components/app-shell';
import { Card, Message, SelectField, TextMuted, Title } from '@/components/ui-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError, Customer, getCustomers, getOrdersByCustomer, Order, submitOrderSignature } from '@/lib/api';
import { useSession } from '@/lib/session-context';

export default function AssinaturasScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const { baseUrl, session } = useSession();
  const token = session?.accessToken;
  const signatureRef = useRef<SignatureViewRef>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerId, setCustomerId] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'error' } | null>(null);
  const [signatureKey, setSignatureKey] = useState(0);

  const loadCustomers = useCallback(async () => {
    if (!token) return;

    setLoadingCustomers(true);
    try {
      const result = await getCustomers(baseUrl, token);
      setCustomers([...result].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      setMessage({ text: error instanceof ApiError ? error.message : 'Não foi possível carregar os clientes.', tone: 'error' });
    } finally {
      setLoadingCustomers(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setOrderNumber('');
    setOrders([]);

    if (!token || !customerId) return;

    let cancelled = false;
    setLoadingOrders(true);

    getOrdersByCustomer(baseUrl, token, Number(customerId))
      .then((result) => {
        if (cancelled) return;
        setOrders([...result].sort((a, b) => b.order_number - a.order_number));
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage({ text: error instanceof ApiError ? error.message : 'Não foi possível carregar as ordens do cliente.', tone: 'error' });
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, token, customerId]);

  const customerOptions = useMemo(
    () => [
      { label: loadingCustomers ? 'Carregando clientes...' : 'Selecione o cliente', value: '' },
      ...customers.map((customer) => ({ label: customer.name, value: String(customer.id) })),
    ],
    [customers, loadingCustomers],
  );

  const orderOptions = useMemo(
    () => [
      { label: loadingOrders ? 'Carregando ordens...' : 'Selecione a ordem de serviço', value: '' },
      ...orders.map((order) => ({
        label: `OS #${order.order_number} - ${order.defect || order.service_type || order.model || 'Sem descrição'}${
          order.has_customer_signature ? ' (já assinada)' : ''
        }`,
        value: String(order.order_number),
      })),
    ],
    [orders, loadingOrders],
  );

  const selectedOrder = useMemo(() => orders.find((order) => String(order.order_number) === orderNumber) ?? null, [orders, orderNumber]);

  const handleEmpty = () => {
    setMessage({ text: 'Peça para o cliente assinar antes de confirmar.', tone: 'error' });
  };

  const handleOK = async (signature: string) => {
    if (!token || !selectedOrder) return;

    setSaving(true);
    setMessage(null);

    try {
      const base64 = signature.replace(/^data:image\/\w+;base64,/, '');
      await submitOrderSignature(baseUrl, token, selectedOrder.order_number, base64);
      setMessage({ text: `Assinatura da OS #${selectedOrder.order_number} registrada com sucesso.`, tone: 'info' });
      setOrders((current) =>
        current.map((order) => (order.order_number === selectedOrder.order_number ? { ...order, has_customer_signature: true } : order)),
      );
      // Força o WebView da assinatura a remontar limpo pra próxima OS.
      setSignatureKey((key) => key + 1);
    } catch (error) {
      setMessage({ text: error instanceof ApiError ? error.message : 'Não foi possível salvar a assinatura.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <AppShell>
        <Message tone="error">Entre no app para registrar assinaturas.</Message>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card>
        <Title>Assinatura do cliente</Title>
        <TextMuted>
          Selecione o cliente e a ordem de serviço já cadastrada no balcão, depois peça para o cliente assinar na tela confirmando o
          recebimento do equipamento.
        </TextMuted>

        <SelectField label="Cliente" value={customerId} options={customerOptions} onChange={setCustomerId} />
        <SelectField label="Ordem de serviço" value={orderNumber} options={orderOptions} onChange={setOrderNumber} />

        {message ? <Message tone={message.tone}>{message.text}</Message> : null}
      </Card>

      {selectedOrder ? (
        <Card>
          <Title>OS #{selectedOrder.order_number}</Title>
          {selectedOrder.has_customer_signature ? (
            <Message tone="info">Esta ordem já possui uma assinatura registrada. Assinar novamente vai substituí-la.</Message>
          ) : null}
          <View style={[styles.signatureBox, { borderColor: colors.border }]}>
            <SignatureView
              key={signatureKey}
              ref={signatureRef}
              onOK={handleOK}
              onEmpty={handleEmpty}
              descriptionText=""
              clearText="Limpar"
              confirmText="Confirmar assinatura"
              webStyle={signatureWebStyle}
              autoClear={false}
            />
          </View>
          {saving ? <TextMuted>Salvando assinatura...</TextMuted> : null}
        </Card>
      ) : null}
    </AppShell>
  );
}

const signatureWebStyle = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { margin: 8px; }
  body,html { width: 100%; height: 100%; }
`;

const styles = StyleSheet.create({
  signatureBox: {
    height: 280,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
