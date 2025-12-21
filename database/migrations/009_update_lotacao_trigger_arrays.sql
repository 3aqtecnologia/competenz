-- Migration: Update lotacao trigger for array-based area matching
-- Description: Updates the check_lotacao_area_match function to handle area_tecnologica as array
-- Drop and recreate the function with array logic
CREATE OR REPLACE FUNCTION check_lotacao_area_match() RETURNS TRIGGER AS $$
DECLARE uc_areas TEXT [];
docente_areas TEXT [];
has_match BOOLEAN := FALSE;
uc_area TEXT;
BEGIN -- Get UC areas (now an array)
SELECT area_tecnologica INTO uc_areas
FROM unidades_curriculares
WHERE id = NEW.unidade_curricular_id;
-- Get Teacher areas
SELECT areas_atuacao INTO docente_areas
FROM docentes
WHERE id = NEW.docente_id;
-- Validation
IF uc_areas IS NULL
OR array_length(uc_areas, 1) IS NULL THEN RAISE EXCEPTION 'A Unidade Curricular selecionada não possui áreas tecnológicas definidas.';
END IF;
IF docente_areas IS NULL
OR array_length(docente_areas, 1) IS NULL THEN RAISE EXCEPTION 'O Docente selecionado não possui áreas de atuação definidas.';
END IF;
-- Check if there's at least ONE overlapping area
-- Loop through UC areas and check if any exists in docente areas
FOREACH uc_area IN ARRAY uc_areas LOOP IF uc_area = ANY(docente_areas) THEN has_match := TRUE;
EXIT;
-- Found a match, no need to continue
END IF;
END LOOP;
IF NOT has_match THEN RAISE EXCEPTION 'O Docente não possui nenhuma das áreas de atuação necessárias (%) para esta Unidade Curricular.',
array_to_string(uc_areas, ', ');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger already exists, just ensuring it uses the updated function
-- No need to recreate the trigger itself