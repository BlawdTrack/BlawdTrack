import { Alert, Box, Button, CircularProgress, Paper, Switch, Typography } from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { CARD_SX } from './formStyles';

/**
 * Panel derecho de "Roles y permisos": los permisos del rol del usuario con un interruptor cada uno. Los
 * que no se pueden editar aparecen fijos. Las acciones quedan fijas arriba; la lista se desplaza por dentro.
 * @param {{ user: object, roleGroup?: object, selected: Set<string>, onToggle: (code: string) => void,
 *   onSave: Function, onReset: Function, saving: boolean, hasChanges: boolean, canReset: boolean,
 *   error?: string }} props
 */
export default function PermissionMatrixPanel({
  user, roleGroup, selected, onToggle, onSave, onReset, saving, hasChanges, canReset, error,
}) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #E4DED7', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>
            Matriz de control de acceso
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
            Permisos de {user.fullName}. Solo se pueden modificar los que corresponden a su rol.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RestartAltRounded />} onClick={onReset} disabled={!canReset || saving}>
            Restablecer predeterminados
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={saving ? <CircularProgress size={19} color="inherit" /> : <SaveOutlined />}
            onClick={onSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Guardando...' : 'Aplicar cambios'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ m: 2, mb: 0 }}>{error}</Alert>}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 1 }}>
        {roleGroup && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
              <Typography component="h3" sx={{ fontWeight: 700, fontSize: 16 }}>{roleGroup.name}</Typography>
              <Typography sx={{ fontSize: 14, color: '#6B6560' }}>{roleGroup.permissions.length} permisos</Typography>
              {!user.editable && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#6B6560', fontSize: 14 }}>
                  <LockOutlined fontSize="small" aria-hidden="true" />
                  Fijos
                </Box>
              )}
            </Box>
            {roleGroup.permissions.map((permission) => {
              const editable = user.editable && user.allowedPermissions.includes(permission.code);
              const checked = editable ? selected.has(permission.code) : permission.defaultGranted;
              return (
                <Box
                  key={permission.code}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: 56, borderTop: '1px solid #F1ECE7', opacity: editable ? 1 : 0.75 }}
                >
                  <Typography sx={{ fontSize: 16 }}>{permission.description}</Typography>
                  <Switch
                    checked={checked}
                    disabled={!editable}
                    onChange={() => onToggle(permission.code)}
                    slotProps={{
                      input: {
                        'aria-label': `${permission.description}: ${checked ? 'permitido' : 'denegado'}${editable ? '' : ', no editable'}`,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </>
        )}
      </Box>
    </Paper>
  );
}
