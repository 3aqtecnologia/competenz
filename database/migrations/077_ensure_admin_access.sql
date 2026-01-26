-- Ensure Administrator has full permissions for the new modules
UPDATE perfis
SET permissoes = '{
  "dashboard": ["visualizar"],
  "secretaria": ["visualizar", "criar", "editar", "excluir"],
  "pedagogico": ["visualizar", "criar", "editar"],
  "planejamento": ["visualizar", "criar", "editar", "excluir"],
  "usuarios": ["visualizar", "criar", "editar", "excluir"],
  "perfis": ["visualizar", "criar", "editar", "excluir"],
  "turmas": ["visualizar", "criar", "editar", "excluir", "visualizar_vinculadas", "visualizar_por_docente"],
  "docentes": ["visualizar", "criar", "editar", "visualizar_vinculados"],
  "alunos": ["visualizar", "criar", "editar", "excluir"],
  "ambientes": ["visualizar", "criar", "editar", "excluir"],
  "cursos": ["visualizar", "criar", "editar", "excluir"],
  "matrizes": ["visualizar", "criar", "editar", "excluir"],
  "frequencia": ["visualizar", "criar", "editar", "enviar"]
}'::jsonb
WHERE nome = 'Administrador';
-- Verify and ensure table existence comments (optional documentation)
COMMENT ON TABLE usuarios IS 'System users with profile linkage';
COMMENT ON TABLE perfis IS 'Access profiles and permission sets';