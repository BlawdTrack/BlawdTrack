import { useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { PACKAGE_FILE_ACCEPT, PACKAGE_FILE_FORMAT_CHIPS } from '../../utils/packageFile';
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
        p: { xs: 3, md: 6 },
        border: '2px dashed',
        borderColor: dragging ? 'secondary.main' : 'neutral.borderStrong',
        borderRadius: RADIUS.lg,
        bgcolor: dragging ? 'secondary.light' : 'background.default',
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
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.xl, color: 'primary.main' }}>
        Arrastra aquí el archivo de Zoho Inventory
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: FONT.md, maxWidth: rem(480) }}>
        o selecciónalo desde tu computadora.
      </Typography>
      <Button
        variant="contained"
        disabled={disabled}
        startIcon={<InsertDriveFileOutlinedIcon />}
        onClick={() => inputRef.current?.click()}
        sx={{ fontWeight: 700, minHeight: 48, px: 3, borderRadius: RADIUS.sm }}
      >
        Seleccionar archivo
      </Button>
      <Box component="ul" aria-label="Formatos admitidos" sx={{ display: 'flex', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
        {PACKAGE_FILE_FORMAT_CHIPS.map((chip) => (
          <Box
            key={chip}
            component="li"
            sx={{ px: 1.5, py: 0.25, border: '1px solid', borderColor: 'neutral.borderStrong', borderRadius: rem(999), fontSize: FONT.xs, fontWeight: 700, color: 'text.secondary' }}
          >
            {chip}
          </Box>
        ))}
      </Box>
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
