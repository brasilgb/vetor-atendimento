import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { ApiCompany, Budget } from '@/lib/api';

export async function shareBudgetPdf(budget: Budget, company?: ApiCompany | null) {
  const html = buildBudgetHtml(budget, company);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento não está disponível neste aparelho.');
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: `Compartilhar orçamento ${budget.budget_number}`,
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
  });
}

function buildBudgetHtml(budget: Budget, company?: ApiCompany | null) {
  const equipment = budget.equipment?.equipment ?? 'Equipamento não informado';
  const issuedAt = formatDate(budget.created_at);
  const validity = budget.validity ? `${budget.validity} dias` : 'Não informada';

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      @page { margin: 28px; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #172033;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        line-height: 1.45;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 3px solid #00b4ff;
        padding-bottom: 16px;
        margin-bottom: 24px;
      }
      .company { font-size: 20px; font-weight: 700; color: #15365f; }
      .document { text-align: right; }
      .document h1 { margin: 0; font-size: 24px; color: #15365f; }
      .document p { margin: 2px 0 0; color: #637083; }
      .section {
        border: 1px solid #d8e0ea;
        border-radius: 8px;
        margin-bottom: 16px;
        overflow: hidden;
      }
      .section-title {
        margin: 0;
        padding: 9px 12px;
        background: #eef2f7;
        color: #15365f;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .section-content { padding: 12px; }
      .grid { display: flex; flex-wrap: wrap; gap: 12px; }
      .field { width: calc(50% - 6px); }
      .label { color: #637083; font-size: 11px; text-transform: uppercase; }
      .value { margin-top: 2px; font-weight: 600; }
      .description { white-space: pre-wrap; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 8px 0; border-bottom: 1px solid #e6ebf1; }
      td:last-child { text-align: right; font-weight: 600; }
      .total td {
        border-bottom: 0;
        padding-top: 12px;
        color: #15365f;
        font-size: 17px;
        font-weight: 700;
      }
      .footer {
        margin-top: 28px;
        color: #637083;
        font-size: 11px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div class="company">${escapeHtml(company?.name || 'VetorOS')}</div>
      <div class="document">
        <h1>Orçamento</h1>
        <p>Nº ${escapeHtml(String(budget.budget_number))}</p>
      </div>
    </header>

    <section class="section">
      <h2 class="section-title">Dados do orçamento</h2>
      <div class="section-content grid">
        ${field('Equipamento', equipment)}
        ${field('Modelo', budget.model)}
        ${field('Serviço', budget.service)}
        ${field('Emissão', issuedAt)}
        ${field('Prazo estimado', formatHours(budget.estimated_time))}
        ${field('Garantia', formatMonths(budget.warranty))}
        ${field('Validade', validity)}
      </div>
    </section>

    ${
      budget.description
        ? `<section class="section">
      <h2 class="section-title">Descrição</h2>
      <div class="section-content description">${escapeHtml(budget.description)}</div>
    </section>`
        : ''
    }

    <section class="section">
      <h2 class="section-title">Valores</h2>
      <div class="section-content">
        <table>
          <tr><td>Peças</td><td>${formatCurrency(budget.part_value)}</td></tr>
          <tr><td>Mão de obra</td><td>${formatCurrency(budget.labor_value)}</td></tr>
          <tr class="total"><td>Total</td><td>${formatCurrency(budget.total_value)}</td></tr>
        </table>
      </div>
    </section>

    ${
      budget.obs
        ? `<section class="section">
      <h2 class="section-title">Observações</h2>
      <div class="section-content description">${escapeHtml(budget.obs)}</div>
    </section>`
        : ''
    }

    <footer class="footer">Documento gerado pelo VetorOS Atendimento.</footer>
  </body>
</html>`;
}

function field(label: string, value: string) {
  return `<div class="field"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div></div>`;
}

function formatCurrency(value: string | number | null | undefined) {
  const parsedValue = typeof value === 'number' ? value : Number(value ?? 0);

  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(parsedValue) ? parsedValue : 0,
  );
}

function formatDate(value?: string) {
  if (!value) return 'Não informada';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informada' : date.toLocaleDateString('pt-BR');
}

function formatHours(value: string | null | undefined) {
  return value ? `${value} hs` : 'Não informado';
}

function formatMonths(value: string | null | undefined) {
  return value ? `${value} meses` : 'Não informada';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
