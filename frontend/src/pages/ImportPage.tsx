import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { Order } from '../types/Order';
import CSVImport from '../components/CSVImport';

interface ImportPageProps {
  onImportSuccess: (orders: Order[]) => void;
}

const ImportPage: React.FC<ImportPageProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulação de upload
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploading(false);

          // Simulação de resultado
          if (Math.random() > 0.3) {
            setResult({
              success: true,
              message: 'Importação concluída com sucesso!',
              details: [
                `${Math.floor(Math.random() * 100)} registros importados`,
                `${Math.floor(Math.random() * 10)} registros atualizados`,
                `${Math.floor(Math.random() * 5)} registros ignorados`,
              ],
            });
          } else {
            setResult({
              success: false,
              message: 'Erro na importação',
              details: [
                'Formato de arquivo inválido',
                'Colunas obrigatórias ausentes',
                'Verifique o modelo de importação',
              ],
            });
          }
        }
        return newProgress;
      });
    }, 300);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Importar Dados
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Upload de Arquivo
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 3, color: '#334155' }}>
              Importação de Pedidos
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                  }}
                >
                  Selecionar Arquivo
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Arquivo selecionado: {file.name}
                </Typography>
              )}
            </Box>

            {uploading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 5, height: 8 }} />
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
                  Processando... {progress}%
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                disabled={!file || uploading}
                onClick={handleUpload}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                  flexGrow: 1
                }}
              >
                Importar
              </Button>

              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={!file && !result}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                Limpar
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Instruções de Importação
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <AlertTitle>Formatos Suportados</AlertTitle>
              Arquivos CSV, Excel (.xlsx, .xls)
            </Alert>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Requisitos para importação:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="A primeira linha deve conter os cabeçalhos das colunas" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Campos obrigatórios devem estar preenchidos" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Datas devem estar no formato DD/MM/AAAA" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Valores decimais devem usar ponto como separador" />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Baixe o modelo:
            </Typography>

            <List dense>
              <ListItem component="a" href="/templates/pedidos.xlsx" download>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <UploadFileIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Modelo de Pedidos" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {result && (
          <Grid item xs={12}>
            <Alert
              severity={result.success ? "success" : "error"}
              sx={{ borderRadius: '12px' }}
            >
              <AlertTitle>{result.message}</AlertTitle>
              {result.details && (
                <List dense>
                  {result.details.map((detail, index) => (
                    <ListItem key={index} sx={{ p: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {result.success ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <ErrorIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={detail} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ImportPage;
