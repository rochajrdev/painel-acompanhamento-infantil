import type { ChildRecord } from "../types/child.types.js";
import { pool } from "../db/database.js";

type ChildRow = ChildRecord;

export interface ChildrenFilters {
  q?: string;
  bairro?: string;
  revisado?: boolean;
  incompleto?: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedChildrenResult {
  items: ChildRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizeAlertas(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeSaude(value: ChildRecord["saude"]): ChildRecord["saude"] {
  if (!value) {
    return null;
  }

  return {
    ultima_consulta: value.ultima_consulta ?? null,
    vacinas_em_dia: value.vacinas_em_dia ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function normalizeEducacao(value: ChildRecord["educacao"]): ChildRecord["educacao"] {
  if (!value) {
    return null;
  }

  return {
    escola: value.escola ?? null,
    frequencia_percent: value.frequencia_percent ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function normalizeAssistenciaSocial(
  value: ChildRecord["assistencia_social"]
): ChildRecord["assistencia_social"] {
  if (!value) {
    return null;
  }

  return {
    cad_unico: value.cad_unico ?? null,
    beneficio_ativo: value.beneficio_ativo ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function mapRow(row: ChildRow): ChildRecord {
  return {
    ...row,
    saude: normalizeSaude(row.saude),
    educacao: normalizeEducacao(row.educacao),
    assistencia_social: normalizeAssistenciaSocial(row.assistencia_social)
  };
}

function buildWhereClause(filters: ChildrenFilters): {
  whereSql: string;
  values: Array<string | boolean>;
} {
  const conditions: string[] = [];
  const values: Array<string | boolean> = [];

  if (filters.q) {
    values.push(`%${filters.q}%`);
    const param = `$${values.length}`;
    conditions.push(`(nome ILIKE ${param} OR responsavel ILIKE ${param} OR id ILIKE ${param})`);
  }

  if (filters.bairro) {
    values.push(`%${filters.bairro}%`);
    conditions.push(`bairro ILIKE $${values.length}`);
  }

  if (typeof filters.revisado === "boolean") {
    values.push(filters.revisado);
    conditions.push(`revisado = $${values.length}`);
  }

  if (typeof filters.incompleto === "boolean") {
    if (filters.incompleto) {
      conditions.push("(saude IS NULL OR educacao IS NULL OR assistencia_social IS NULL)");
    } else {
      conditions.push("(saude IS NOT NULL AND educacao IS NOT NULL AND assistencia_social IS NOT NULL)");
    }
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereSql, values };
}

export class ChildrenRepository {
  async count(): Promise<number> {
    const result = await pool.query<{ total: string }>(
      "SELECT count(*)::text AS total FROM children"
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  async upsertMany(children: ChildRecord[]): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const child of children) {
        await client.query(
          `
            INSERT INTO children (
              id,
              nome,
              data_nascimento,
              bairro,
              responsavel,
              saude,
              educacao,
              assistencia_social,
              revisado,
              revisado_por,
              revisado_em,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, $11, now())
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome,
              data_nascimento = EXCLUDED.data_nascimento,
              bairro = EXCLUDED.bairro,
              responsavel = EXCLUDED.responsavel,
              saude = EXCLUDED.saude,
              educacao = EXCLUDED.educacao,
              assistencia_social = EXCLUDED.assistencia_social,
              revisado = EXCLUDED.revisado,
              revisado_por = EXCLUDED.revisado_por,
              revisado_em = EXCLUDED.revisado_em,
              updated_at = now()
          `,
          [
            child.id,
            child.nome,
            child.data_nascimento,
            child.bairro,
            child.responsavel,
            child.saude ? JSON.stringify(child.saude) : null,
            child.educacao ? JSON.stringify(child.educacao) : null,
            child.assistencia_social ? JSON.stringify(child.assistencia_social) : null,
            child.revisado,
            child.revisado_por,
            child.revisado_em
          ]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findAllPaginated(
    filters: ChildrenFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedChildrenResult> {
    const { whereSql, values } = buildWhereClause(filters);
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    const countResult = await pool.query<{ total: string }>(
      `
        SELECT count(*)::text AS total
        FROM children
        ${whereSql}
      `,
      values
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const result = await pool.query<ChildRow>(
      `
        SELECT
          id,
          nome,
          data_nascimento::text AS data_nascimento,
          bairro,
          responsavel,
          saude,
          educacao,
          assistencia_social,
          revisado,
          revisado_por,
          revisado_em::text AS revisado_em
        FROM children
        ${whereSql}
        ORDER BY nome ASC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `
      ,
      [...values, String(pageSize), String(offset)]
    );

    return {
      items: result.rows.map(mapRow),
      total,
      page,
      pageSize,
      totalPages
    };
  }

  async findById(id: string): Promise<ChildRecord | null> {
    const result = await pool.query<ChildRow>(
      `
        SELECT
          id,
          nome,
          data_nascimento::text AS data_nascimento,
          bairro,
          responsavel,
          saude,
          educacao,
          assistencia_social,
          revisado,
          revisado_por,
          revisado_em::text AS revisado_em
        FROM children
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async markAsReviewed(
    id: string,
    reviewedBy: string
  ): Promise<ChildRecord | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const checkResult = await client.query(
        "SELECT id FROM children WHERE id = $1",
        [id]
      );

      if (checkResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const updateResult = await client.query<ChildRow>(
        `
          UPDATE children
          SET
            revisado = true,
            revisado_por = $2,
            revisado_em = now(),
            updated_at = now()
          WHERE id = $1
          RETURNING
            id,
            nome,
            data_nascimento::text AS data_nascimento,
            bairro,
            responsavel,
            saude,
            educacao,
            assistencia_social,
            revisado,
            revisado_por,
            revisado_em::text AS revisado_em
        `,
        [id, reviewedBy]
      );

      await client.query(
        `
          INSERT INTO child_reviews (child_id, technician_email)
          VALUES ($1, $2)
        `,
        [id, reviewedBy]
      );

      await client.query("COMMIT");

      return updateResult.rows[0] ? mapRow(updateResult.rows[0]) : null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getSummary(): Promise<{
    total_criancas: number;
    total_revisadas: number;
    alertas_saude: number;
    alertas_educacao: number;
    alertas_assistencia: number;
    criancas_saude: number;
    criancas_educacao: number;
    criancas_assistencia: number;
    criancas_com_alertas: number;
    alertas_totais: number;
    total_alertas: number;
    alertas_por_area: Record<string, {alertas: number; criancas: number}>;
  }> {
    const result = await pool.query<{
      total_criancas: string;
      total_revisadas: string;
      alertas_saude: string;
      alertas_educacao: string;
      alertas_assistencia: string;
      criancas_saude: string;
      criancas_educacao: string;
      criancas_assistencia: string;
      criancas_com_alertas: string;
      total_alertas: string;
      alertas_totais: string;
    }>(
      `
        SELECT
          COUNT(*)::text AS total_criancas,
          SUM(CASE WHEN revisado THEN 1 ELSE 0 END)::text AS total_revisadas,
          COALESCE(SUM(CASE
            WHEN saude IS NOT NULL
              AND jsonb_typeof(saude -> 'alertas') = 'array'
            THEN jsonb_array_length(saude -> 'alertas')
            ELSE 0
          END), 0)::text AS alertas_saude,
          COALESCE(SUM(CASE
            WHEN educacao IS NOT NULL
              AND jsonb_typeof(educacao -> 'alertas') = 'array'
            THEN jsonb_array_length(educacao -> 'alertas')
            ELSE 0
          END), 0)::text AS alertas_educacao,
          COALESCE(SUM(CASE
            WHEN assistencia_social IS NOT NULL
              AND jsonb_typeof(assistencia_social -> 'alertas') = 'array'
            THEN jsonb_array_length(assistencia_social -> 'alertas')
            ELSE 0
          END), 0)::text AS alertas_assistencia,
          COUNT(*) FILTER (
            WHERE saude IS NOT NULL
              AND jsonb_typeof(saude -> 'alertas') = 'array'
              AND jsonb_array_length(saude -> 'alertas') > 0
          )::text AS criancas_saude,
          COUNT(*) FILTER (
            WHERE educacao IS NOT NULL
              AND jsonb_typeof(educacao -> 'alertas') = 'array'
              AND jsonb_array_length(educacao -> 'alertas') > 0
          )::text AS criancas_educacao,
          COUNT(*) FILTER (
            WHERE assistencia_social IS NOT NULL
              AND jsonb_typeof(assistencia_social -> 'alertas') = 'array'
              AND jsonb_array_length(assistencia_social -> 'alertas') > 0
          )::text AS criancas_assistencia,
          COUNT(*) FILTER (
            WHERE (
              saude IS NOT NULL
              AND jsonb_typeof(saude -> 'alertas') = 'array'
              AND jsonb_array_length(saude -> 'alertas') > 0
            ) OR (
              educacao IS NOT NULL
              AND jsonb_typeof(educacao -> 'alertas') = 'array'
              AND jsonb_array_length(educacao -> 'alertas') > 0
            ) OR (
              assistencia_social IS NOT NULL
              AND jsonb_typeof(assistencia_social -> 'alertas') = 'array'
              AND jsonb_array_length(assistencia_social -> 'alertas') > 0
            )
          )::text AS criancas_com_alertas,
          (
            COALESCE(SUM(CASE
              WHEN saude IS NOT NULL
                AND jsonb_typeof(saude -> 'alertas') = 'array'
              THEN jsonb_array_length(saude -> 'alertas')
              ELSE 0
            END), 0)
            +
            COALESCE(SUM(CASE
              WHEN educacao IS NOT NULL
                AND jsonb_typeof(educacao -> 'alertas') = 'array'
              THEN jsonb_array_length(educacao -> 'alertas')
              ELSE 0
            END), 0)
            +
            COALESCE(SUM(CASE
              WHEN assistencia_social IS NOT NULL
                AND jsonb_typeof(assistencia_social -> 'alertas') = 'array'
              THEN jsonb_array_length(assistencia_social -> 'alertas')
              ELSE 0
            END), 0)
          )::text AS total_alertas,
          COUNT(*) FILTER (
            WHERE (
              saude IS NOT NULL
              AND jsonb_typeof(saude -> 'alertas') = 'array'
              AND jsonb_array_length(saude -> 'alertas') > 0
            ) OR (
              educacao IS NOT NULL
              AND jsonb_typeof(educacao -> 'alertas') = 'array'
              AND jsonb_array_length(educacao -> 'alertas') > 0
            ) OR (
              assistencia_social IS NOT NULL
              AND jsonb_typeof(assistencia_social -> 'alertas') = 'array'
              AND jsonb_array_length(assistencia_social -> 'alertas') > 0
            )
          )::text AS alertas_totais
        FROM children
      `
    );

    const row = result.rows[0];
    const alertas_saude = Number(row?.alertas_saude ?? 0);
    const alertas_educacao = Number(row?.alertas_educacao ?? 0);
    const alertas_assistencia = Number(row?.alertas_assistencia ?? 0);
    const criancas_saude = Number(row?.criancas_saude ?? 0);
    const criancas_educacao = Number(row?.criancas_educacao ?? 0);
    const criancas_assistencia = Number(row?.criancas_assistencia ?? 0);

    return {
      total_criancas: Number(row?.total_criancas ?? 0),
      total_revisadas: Number(row?.total_revisadas ?? 0),
      alertas_saude,
      alertas_educacao,
      alertas_assistencia,
      criancas_saude,
      criancas_educacao,
      criancas_assistencia,
      criancas_com_alertas: Number(row?.criancas_com_alertas ?? 0),
      alertas_totais: Number(row?.alertas_totais ?? 0),
      total_alertas: Number(row?.total_alertas ?? 0),
      alertas_por_area: {
        saude: {
          alertas: alertas_saude,
          criancas: criancas_saude
        },
        educacao: {
          alertas: alertas_educacao,
          criancas: criancas_educacao
        },
        assistencia_social: {
          alertas: alertas_assistencia,
          criancas: criancas_assistencia
        }
      }
    };
  }
}

export const childrenRepository = new ChildrenRepository();