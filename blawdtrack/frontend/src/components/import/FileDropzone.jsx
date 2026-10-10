import { useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { PACKAGE_FILE_ACCEPT, PACKAGE_FILE_FORMATS_LABEL } from '../../utils/packageFile';
import { FONT, RADIUS, rem } from '../../theme';

/**
 * Zona para elegir el archivo de paquetes: se puede arrastrar o elegir con el botón "Seleccionar archivo" (que
 * también se usa con el teclado). Entrega el archivo con `onFile`; no valida nada, eso lo hace quien lo recibe.
 * @param {{ onFile: (file: File) => void, disabled?: boolean }} props `disabled` bloquea la zona mientras se carga.
 */
export default function FileDropzone({ onFile, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const emit = (files) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const handleChange = (event) => {
    emit(event.target.files);
    // Se limpia para poder volver a elegir el mismo archivo después de quitarlo.
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) emit(event.dataTransfer?.files);
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'center',
        p: { xs: 3, md: 4 },
        border: '2px dashed',
        borderColor: dragging ? 'secondary.main' : 'neutral.borderStrong',
        borderRadius: RADIUS.md,
        bgcolor: dragging ? 'secondary.light' : 'background.paper',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color .15s ease, background-color .15s ease',
      }}
    >
      <Box
        sx={{
          width: rem(58),
          height: rem(58),
          borderRadius: RADIUS.md,
          bgcolor: 'secondary.light',
          color: 'secondary.text',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UploadFileOutlinedIcon sx={{ fontSize: FONT.h1 }} />
      </Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
        Arrastra aquí el archivo de Zoho Inventory
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: FONT.md, maxWidth: rem(480) }}>
        Formatos admitidos: {PACKAGE_FILE_FORMATS_LABEL} con el listado de paquetes del día. Se extraen número de orden,
        número de envío, cliente, dirección, teléfono y horario de preferencia.
      </Typography>
      <Button variant="outlined" disabled={disabled} onClick={() => inputRef.current?.click()}>
        Seleccionar archivo
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={PACKAGE_FILE_ACCEPT}
        aria-label="Archivo de paquetes de Zoho Inventory"
        disabled={disabled}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
