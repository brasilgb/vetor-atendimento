import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
=======
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405

import { AppShell } from '@/components/app-shell';
import { Card, Message, SelectField, TextMuted, Title } from '@/components/ui-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { shareBudgetPdf } from '@/lib/budget-pdf';
import {
  ApiError,
  Budget,
  BudgetResult,
  getBudgetModels,
  getBudgets,
  getBudgetServices,
  getReportFilters,
  ReportFilters,
} from '@/lib/api';
import { useSession } from '@/lib/session-context';

export default function OrcamentosScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const { baseUrl, session } = useSession();
  const [filters, setFilters] = useState<ReportFilters | null>(null);
  const [report, setReport] = useState<BudgetResult | null>(null);
  const [equipmentId, setEquipmentId] = useState<number | undefined>();
  const [model, setModel] = useState('');
  const [service, setService] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [sharingBudgetId, setSharingBudgetId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const token = session?.accessToken;

  const equipmentOptions = useMemo(
    () => [
      { label: 'Selecione o tipo de equipamento', value: '' },
      ...(filters?.equipments.map((equipment) => ({
        label: equipment.equipment,
        value: String(equipment.id),
      })) ?? []),
    ],
    [filters],
  );

  const modelOptions = useMemo(
    () => [
      { label: loadingModels ? 'Carregando modelos...' : 'Selecione o modelo', value: '' },
      ...models.map((item) => ({
        label: item,
        value: item,
      })),
    ],
    [loadingModels, models],
  );

  const serviceOptions = useMemo(
    () => [
      { label: loadingServices ? 'Carregando serviços...' : 'Selecione o serviço', value: '' },
      ...services.map((item) => ({
        label: item,
        value: item,
      })),
    ],
    [loadingServices, services],
  );

  const loadFilters = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      setFilters(await getReportFilters(baseUrl, token));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Nao foi possivel carregar filtros.');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    async function loadModels() {
      if (!token || !equipmentId) {
        setModels([]);
        setModel('');
        setServices([]);
        setService('');
        setReport(null);
        return;
      }

      setLoadingModels(true);
      setMessage(null);
      setModel('');
      setServices([]);
      setService('');
      setReport(null);

      try {
        const response = await getBudgetModels(baseUrl, token, equipmentId);
        setModels(response.models);
        if (response.models.length === 0) {
          setMessage('Nenhum modelo encontrado para este equipamento.');
        }
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : 'Nao foi possivel carregar modelos.');
      } finally {
        setLoadingModels(false);
      }
    }

    loadModels();
  }, [baseUrl, equipmentId, token]);

  useEffect(() => {
    async function loadServices() {
      if (!token || !equipmentId || !model) {
        setServices([]);
        setService('');
        setReport(null);
        return;
      }

      setLoadingServices(true);
      setMessage(null);
      setService('');
      setReport(null);

      try {
        const response = await getBudgetServices(baseUrl, token, equipmentId, model);
        setServices(response.services);
        if (response.services.length === 0) {
          setMessage('Nenhum serviço encontrado para este modelo.');
        }
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : 'Nao foi possivel carregar serviços.');
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [baseUrl, equipmentId, model, token]);

  const loadReport = useCallback(async () => {
    if (!token) return;

    if (!equipmentId || !model || !service) {
      setReport(null);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      setReport(await getBudgets(baseUrl, token, { equipment_id: equipmentId, model, service }));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Nao foi possivel carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, equipmentId, model, service, token]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

<<<<<<< HEAD
  const handleShareBudget = useCallback(
    async (budget: Budget) => {
      setSharingBudgetId(budget.id);
      setMessage(null);

      try {
        await shareBudgetPdf(budget, session?.company);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Não foi possível compartilhar o orçamento.');
      } finally {
        setSharingBudgetId(null);
      }
    },
    [session?.company],
  );
=======
  const handleShareBudget = useCallback(async (budget: Budget) => {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        await shareBudgetAsText(budget);
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: buildBudgetPdfHtml(budget, session?.company?.name),
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        dialogTitle: `Compartilhar orçamento #${budget.budget_number}`,
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
    } catch {
      setMessage('Nao foi possivel compartilhar este orçamento.');
    }
  }, []);
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405

  if (!session) {
    return (
      <AppShell>
        <Message tone="error">Entre no app para acessar orçamentos.</Message>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card>
        <Title>Consultar orçamento</Title>
        {message ? <Message tone="error">{message}</Message> : null}
        <SelectField
          label="Tipo de equipamento"
          value={equipmentId ? String(equipmentId) : ''}
          options={equipmentOptions}
          onChange={(value) => setEquipmentId(value ? Number(value) : undefined)}
        />
        <SelectField label="Modelo" value={model} options={modelOptions} onChange={setModel} />
        <SelectField label="Serviço" value={service} options={serviceOptions} onChange={setService} />
        {loading ? <TextMuted>Carregando dados do orçamento...</TextMuted> : null}
      </Card>

      {report ? (
        <Card>
          <Title>Orçamentos encontrados</Title>
          {report.budgets.length === 0 ? <TextMuted>Nenhum orçamento encontrado.</TextMuted> : null}
          {report.budgets.map((budget) => (
            <BudgetItem
              key={budget.id}
              budget={budget}
              borderColor={colors.border}
              textColor={colors.text}
              tintColor={colors.tint}
<<<<<<< HEAD
              tintTextColor={colors.tintText}
              sharing={sharingBudgetId === budget.id}
              onShare={() => handleShareBudget(budget)}
=======
              onShare={handleShareBudget}
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
            />
          ))}
        </Card>
      ) : null}
    </AppShell>
  );
}

function BudgetItem({
  budget,
  borderColor,
  textColor,
  tintColor,
<<<<<<< HEAD
  tintTextColor,
  sharing,
=======
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
  onShare,
}: {
  budget: Budget;
  borderColor: string;
  textColor: string;
  tintColor: string;
<<<<<<< HEAD
  tintTextColor: string;
  sharing: boolean;
  onShare: () => void;
=======
  onShare: (budget: Budget) => void;
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
}) {
  return (
    <View style={[styles.orderItem, { borderColor }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderTitle, { color: textColor }]}>
          Orçamento #{budget.budget_number} - {formatCurrency(budget.total_value)}
        </Text>
        <Pressable
          accessibilityLabel={`Compartilhar orçamento ${budget.budget_number}`}
          onPress={() => onShare(budget)}
          style={({ pressed }) => [
            styles.shareButton,
            { borderColor: tintColor, opacity: pressed ? 0.72 : 1 },
          ]}>
          <MaterialIcons name="share" size={18} color={tintColor} />
          <Text style={[styles.shareButtonText, { color: tintColor }]}>Compartilhar</Text>
        </Pressable>
      </View>
      <TextMuted>
        {budget.equipment?.equipment ?? 'Equipamento'} - {budget.model}
      </TextMuted>
      <TextMuted>{budget.service}</TextMuted>
      {budget.description ? <TextMuted>{budget.description}</TextMuted> : null}
      <TextMuted>
        Peças: {formatCurrency(budget.part_value)} | Mão de obra: {formatCurrency(budget.labor_value)}
      </TextMuted>
      <TextMuted>
        Prazo: {formatHours(budget.estimated_time)} | Garantia: {formatMonths(budget.warranty)}
      </TextMuted>
      {budget.obs ? <TextMuted>Obs: {budget.obs}</TextMuted> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Compartilhar orçamento ${budget.budget_number} em PDF`}
        disabled={sharing}
        onPress={onShare}
        style={({ pressed }) => [
          styles.shareButton,
          { backgroundColor: tintColor, opacity: pressed || sharing ? 0.65 : 1 },
        ]}>
        {sharing ? (
          <ActivityIndicator color={tintTextColor} />
        ) : (
          <MaterialIcons name="picture-as-pdf" size={20} color={tintTextColor} />
        )}
        <Text style={[styles.shareButtonText, { color: tintTextColor }]}>
          {sharing ? 'Gerando PDF...' : 'Compartilhar PDF'}
        </Text>
      </Pressable>
    </View>
  );
}

async function shareBudgetAsText(budget: Budget) {
  await Share.share({
    title: `Orçamento #${budget.budget_number}`,
    message: buildBudgetShareMessage(budget),
  });
}

function buildBudgetShareMessage(budget: Budget) {
  return [
    `Orçamento #${budget.budget_number}`,
    `${budget.equipment?.equipment ?? 'Equipamento'} - ${budget.model}`,
    `Serviço: ${budget.service}`,
    budget.description ? `Descrição: ${budget.description}` : null,
    `Peças: ${formatCurrency(budget.part_value)}`,
    `Mão de obra: ${formatCurrency(budget.labor_value)}`,
    `Total: ${formatCurrency(budget.total_value)}`,
    `Prazo: ${formatHours(budget.estimated_time)}`,
    `Garantia: ${formatMonths(budget.warranty)}`,
    budget.validity ? `Validade: ${budget.validity} dias` : null,
    budget.obs ? `Obs: ${budget.obs}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function buildBudgetPdfHtml(budget: Budget, companyName?: string | null) {
  const rows: [string, string | null | undefined][] = [
    ['Equipamento', `${budget.equipment?.equipment ?? 'Equipamento'} - ${budget.model}`],
    ['Serviço', budget.service],
    ['Descrição', budget.description],
    ['Peças', formatCurrency(budget.part_value)],
    ['Mão de obra', formatCurrency(budget.labor_value)],
    ['Total', formatCurrency(budget.total_value)],
    ['Prazo', formatHours(budget.estimated_time)],
    ['Garantia', formatMonths(budget.warranty)],
    ['Validade', budget.validity ? `${budget.validity} dias` : null],
    ['Obs', budget.obs],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        color: #1f2a37;
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 32px;
      }

      .document {
        border: 1px solid #d8e0ea;
        border-radius: 12px;
        padding: 28px;
      }

      .header {
        border-bottom: 2px solid #2f7dd1;
        margin-bottom: 22px;
        padding-bottom: 16px;
      }

      .company {
        color: #637083;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        margin: 0 0 10px;
        text-transform: uppercase;
      }

      h1 {
        color: #163b6d;
        font-size: 26px;
        margin: 0 0 8px;
      }

      .subtitle {
        color: #637083;
        font-size: 14px;
        margin: 0;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid #e5ebf2;
        font-size: 14px;
        padding: 12px 8px;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: #637083;
        font-size: 12px;
        text-transform: uppercase;
        width: 150px;
      }

      .total th,
      .total td {
        color: #163b6d;
        font-size: 18px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main class="document">
      <header class="header">
        ${companyName ? `<p class="company">${escapeHtml(companyName)}</p>` : ''}
        <h1>Orçamento #${escapeHtml(String(budget.budget_number))}</h1>
        <p class="subtitle">${escapeHtml(`${budget.equipment?.equipment ?? 'Equipamento'} - ${budget.model}`)}</p>
      </header>
      <table>
        <tbody>
          ${rows
            .map(([label, value]) => {
              const className = label === 'Total' ? ' class="total"' : '';

              return `<tr${className}><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value: string | number | null | undefined) {
  const parsedValue = typeof value === 'number' ? value : Number(value ?? 0);
  const safeValue = Number.isFinite(parsedValue) ? parsedValue : 0;
  const [integerPart, decimalPart] = Math.abs(safeValue).toFixed(2).split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = safeValue < 0 ? '-' : '';

  return `${sign}R$ ${formattedInteger},${decimalPart}`;
}

function formatHours(value: string | null | undefined) {
  if (!value) return 'Nao informado';
  if (hasUnit(value)) return value;

  return `${value} hs`;
}

function formatMonths(value: string | null | undefined) {
  if (!value) return 'Nao informada';
  if (hasUnit(value)) return value;

  return `${value} meses`;
}

function hasUnit(value: string) {
  return /[^\d\s.,-]/.test(value);
}

const styles = StyleSheet.create({
  orderItem: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 4,
  },
  orderHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  orderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 190,
  },
  shareButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shareButton: {
    minHeight: 46,
    marginTop: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
