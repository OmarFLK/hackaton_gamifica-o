"""Atualização aditiva da primeira bancada para a fundação do MVP.

create_all não acrescenta colunas em tabelas existentes. Esta atualização
preserva pacientes, vínculos, agenda, relatos e mensagens da demo anterior.
Não substitui uma estratégia Alembic antes de um piloto real.
"""
from sqlalchemy import inspect, text

LEGACY_PATIENT_COLUMNS = {
    'clinical_notes': 'TEXT',
    'cancer_type_demo': 'VARCHAR(120)',
    'clinical_stage_demo': 'VARCHAR(60)',
}


def upgrade_legacy_schema(engine):
    with engine.begin() as connection:
        names = {column['name'] for column in inspect(connection).get_columns('patients')}
        for name, sql_type in LEGACY_PATIENT_COLUMNS.items():
            if name not in names:
                # Identificadores vêm exclusivamente da lista fixa acima.
                connection.execute(text(f'ALTER TABLE patients ADD COLUMN {name} {sql_type}'))
