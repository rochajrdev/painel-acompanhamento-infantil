export const childrenTableSql = `
  CREATE TABLE IF NOT EXISTS children (
    id text PRIMARY KEY,
    nome text NOT NULL,
    data_nascimento date NOT NULL,
    bairro text NOT NULL,
    responsavel text NOT NULL,
    saude jsonb,
    educacao jsonb,
    assistencia_social jsonb,
    revisado boolean NOT NULL DEFAULT false,
    revisado_por text,
    revisado_em timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS children_bairro_idx ON children (bairro);
  CREATE INDEX IF NOT EXISTS children_revisado_idx ON children (revisado);
`;

export const techniciansTableSql = `
  CREATE TABLE IF NOT EXISTS technicians (
    id bigserial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
`;

export const childReviewsTableSql = `
  CREATE TABLE IF NOT EXISTS child_reviews (
    id bigserial PRIMARY KEY,
    child_id text NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    technician_email text NOT NULL,
    reviewed_at timestamptz NOT NULL DEFAULT now(),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS child_reviews_child_id_idx ON child_reviews (child_id);
`;

export const databaseSchemaSql = `${childrenTableSql}\n${techniciansTableSql}\n${childReviewsTableSql}`;