export type ApiUser = {
  id: number;
  tenant_id: number;
  user_number: number;
  name: string;
  email: string;
  roles: number;
  status: number;
  avatar?: string | null;
  avatar_url?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  image?: string | null;
  image_url?: string | null;
};

export type ApiCompany = {
  name?: string | null;
  logo?: string | null;
  logo_url?: string | null;
};

export type Customer = {
  id: number;
  tenant_id: number;
  customer_number: number;
  name: string;
  cpfcnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  observations?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomerPayload = {
  name: string;
  cpfcnpj?: string;
  birth?: string;
  email?: string;
  zipcode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  complement?: string;
  number?: number;
  phone?: string;
  contactname?: string;
  whatsapp?: string;
  contactphone?: string;
  observations?: string;
};

export type Equipment = {
  id: number;
  equipment_number: number;
  equipment: string;
};

export type ReportFilters = {
  equipments: Equipment[];
};

export type Budget = {
  id: number;
  tenant_id: number;
  budget_number: number;
  equipment_id: number;
  equipment?: {
    id: number;
    equipment_number: number;
    equipment: string;
  } | null;
  model: string;
  service: string;
  description?: string | null;
  estimated_time?: string | null;
  part_value?: string | number | null;
  labor_value?: string | number | null;
  total_value?: string | number | null;
  warranty?: string | null;
  validity?: number | null;
  obs?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BudgetResult = {
  filters: {
    equipment_id: number;
    model: string;
    service: string;
  };
  budgets: Budget[];
};

type ModelListResponse = {
  equipment_id?: number;
  models?: string[];
  budgets?: Budget[];
};

type ServiceListResponse = {
  equipment_id?: number;
  model?: string;
  services?: string[];
  budgets?: Budget[];
};

export type BudgetQuery = {
  equipment_id: number;
  model: string;
  service: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  result: T;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

const trimBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

async function request<T>(
  baseUrl: string,
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${trimBaseUrl(baseUrl)}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<T>>;

  if (!response.ok) {
    throw new ApiError(json.message ?? 'Nao foi possivel concluir a requisicao.', response.status, json.errors);
  }

  return json.result as T;
}

export async function login(baseUrl: string, email: string, password: string) {
  const response = await fetch(`${trimBaseUrl(baseUrl)}/loginuser`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const json = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<ApiUser>> & {
    access_token?: string;
    company?: ApiCompany | null;
  };

  if (!response.ok) {
    throw new ApiError(json.message ?? 'Nao foi possivel fazer login.', response.status, json.errors);
  }

  if (!json.result || !json.access_token) {
    throw new ApiError('Resposta de login incompleta.', response.status);
  }

  return {
    access_token: json.access_token,
    user: json.result,
    company: json.company ?? null,
  };
}

export async function logout(baseUrl: string, token: string) {
  await request(baseUrl, '/logoutuser', token);
}

export async function getCustomers(baseUrl: string, token: string) {
  return request<Customer[]>(baseUrl, '/clientes', token);
}

export async function createCustomer(baseUrl: string, token: string, payload: CustomerPayload) {
  return request<Customer>(baseUrl, '/clientes/pre-cadastro', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReportFilters(baseUrl: string, token: string) {
  return request<ReportFilters>(baseUrl, '/orcamentos/filtros', token);
}

export async function getBudgetModels(baseUrl: string, token: string, equipmentId: number) {
  const params = new URLSearchParams({ equipment_id: String(equipmentId) });

  const result = await request<ModelListResponse | string[] | Budget[]>(
    baseUrl,
    `/orcamentos/modelos?${params.toString()}`,
    token,
  );

  return {
    equipment_id: equipmentId,
    models: normalizeModelList(result),
  };
}

export async function getBudgetServices(baseUrl: string, token: string, equipmentId: number, model: string) {
  const params = new URLSearchParams({ equipment_id: String(equipmentId), model });

  const result = await request<ServiceListResponse | string[] | Budget[]>(
    baseUrl,
    `/orcamentos/servicos?${params.toString()}`,
    token,
  );

  return {
    equipment_id: equipmentId,
    model,
    services: normalizeServiceList(result),
  };
}

export async function getBudgets(baseUrl: string, token: string, query: BudgetQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      params.set(key, String(value));
    }
  });

  const result = await request<BudgetResult | Budget[] | null | undefined>(
    baseUrl,
    `/orcamentos?${params.toString()}`,
    token,
  );

  return normalizeBudgetResult(result, query);
}

function normalizeBudgetResult(result: BudgetResult | Budget[] | null | undefined, query: BudgetQuery): BudgetResult {
  if (!result) {
    return {
      filters: query,
      budgets: [],
    };
  }

  if (Array.isArray(result)) {
    return {
      filters: query,
      budgets: result,
    };
  }

  return {
    filters: {
      equipment_id: result.filters?.equipment_id ?? query.equipment_id,
      model: result.filters?.model ?? query.model,
      service: result.filters?.service ?? query.service,
    },
    budgets: Array.isArray(result.budgets) ? result.budgets : [],
  };
}

function normalizeModelList(result: ModelListResponse | string[] | Budget[]) {
  if (Array.isArray(result)) {
    return uniqueStrings(
      result.map((item) => (typeof item === 'string' ? item : item.model)).filter((item): item is string => Boolean(item)),
    );
  }

  if (Array.isArray(result.models)) {
    return uniqueStrings(result.models);
  }

  if (Array.isArray(result.budgets)) {
    return uniqueStrings(result.budgets.map((budget) => budget.model));
  }

  return [];
}

function normalizeServiceList(result: ServiceListResponse | string[] | Budget[]) {
  if (Array.isArray(result)) {
    return uniqueStrings(
      result.map((item) => (typeof item === 'string' ? item : item.service)).filter((item): item is string => Boolean(item)),
    );
  }

  if (Array.isArray(result.services)) {
    return uniqueStrings(result.services);
  }

  if (Array.isArray(result.budgets)) {
    return uniqueStrings(result.budgets.map((budget) => budget.service));
  }

  return [];
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
