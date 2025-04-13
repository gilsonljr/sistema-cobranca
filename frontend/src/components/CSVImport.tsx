import React, { useRef, useState } from 'react';
import { 
  Button, 
  Box, 
  Alert, 
  CircularProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Order, parseCSVRow } from '../types/Order';

interface CSVImportProps {
  onImportSuccess: (orders: Order[]) => void;
}

const requiredHeaders = [
  'Data Venda',
  'ID Venda',
  'Cliente',
  'Telefone',
  'Oferta',
  'Valor Venda',
  'Status',
  'Situação Venda',
  'Valor Recebido',
  'Historico',
  'Ultima Atualização',
  'Código de Rastreio',
  'Status Correios',
  'Vendedor',
  'Operador',
  'Zap',
  'ESTADO DO DESTINATÁRIO',
  'CIDADE DO DESTINATÁRIO',
  'RUA DO DESTINATÁRIO',
  'CEP DO DESTINATÁRIO',
  'COMPLEMENTO DO DESTINATÁRIO',
  'BAIRRO DO DESTINATÁRIO',
  'NÚMERO DO ENDEREÇO DO DESTINATÁRIO',
  'DATA ESTIMADA DE CHEGADA',
  'CÓDIGO DO AFILIADO',
  'NOME DO AFILIADO',
  'E-MAIL DO AFILIADO',
  'DOCUMENTO DO AFILIADO',
  'DATA DE RECEBIMENTO',
  'Data_Negociacao',
  'FormaPagamento',
  'DOCUMENTO CLIENTE',
  'Parcial',
  'Pagamento_Parcial',
  'FormaPagamentoParcial',
  'DataPagamentoParcial'
];

const CSVImport: React.FC<CSVImportProps> = ({ onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    orders: Order[];
    totalSales: number;
    skippedLines: number;
    problematicLines: number[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseLine = (line: string): string[] => {
    // Try to detect if the file is TSV or CSV
    const isTSV = line.includes('\t') && !line.includes(',');
    const separator = isTSV ? '\t' : ',';
    
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const validateHeaders = (headers: string[]): string | null => {
    const missingHeaders = requiredHeaders.filter(
      header => !headers.some(h => h.toLowerCase() === header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      return `Cabeçalhos obrigatórios ausentes:\n${missingHeaders.join('\n')}`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error('Não foi possível ler o arquivo');
        }

        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');

        if (lines.length < 2) {
          throw new Error('O arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
        }

        const headers = parseLine(lines[0]);
        const headerError = validateHeaders(headers);
        if (headerError) {
          throw new Error(headerError);
        }

        const orders: Order[] = [];
        let skippedLines = 0;
        let problematicLines: number[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseLine(lines[i]);
          
          // If the line is empty or has fewer columns than headers, pad it with empty strings
          if (values.length < headers.length) {
            const paddedValues = [...values];
            while (paddedValues.length < headers.length) {
              paddedValues.push('');
            }
            values.splice(0, values.length, ...paddedValues);
          }

          // Validate required fields
          const requiredFields = ['Data Venda', 'ID Venda', 'Cliente', 'Valor Venda'];
          const missingFields = requiredFields.filter(field => {
            const index = headers.indexOf(field);
            return index === -1 || !values[index]?.trim();
          });

          if (missingFields.length > 0) {
            problematicLines.push(i + 1);
            skippedLines++;
            continue;
          }

          // Create order object with proper mapping
          const order: Order = {
            dataVenda: values[headers.indexOf('Data Venda')] || '',
            idVenda: values[headers.indexOf('ID Venda')] || '',
            cliente: values[headers.indexOf('Cliente')] || '',
            telefone: values[headers.indexOf('Telefone')] || '',
            oferta: values[headers.indexOf('Oferta')] || '',
            valorVenda: parseFloat(values[headers.indexOf('Valor Venda')]?.replace('R$', '').replace('.', '').replace(',', '.').trim() || '0'),
            status: values[headers.indexOf('Status')] || '',
            situacaoVenda: values[headers.indexOf('Situação Venda')] || '',
            valorRecebido: parseFloat(values[headers.indexOf('Valor Recebido')]?.replace('R$', '').replace('.', '').replace(',', '.').trim() || '0'),
            historico: values[headers.indexOf('Historico')] || '',
            ultimaAtualizacao: values[headers.indexOf('Ultima Atualização')] || '',
            codigoRastreio: values[headers.indexOf('Código de Rastreio')] || '',
            statusCorreios: values[headers.indexOf('Status Correios')] || '',
            vendedor: values[headers.indexOf('Vendedor')] || '',
            operador: values[headers.indexOf('Operador')] || '',
            zap: values[headers.indexOf('Zap')] || '',
            estadoDestinatario: values[headers.indexOf('ESTADO DO DESTINATÁRIO')] || '',
            cidadeDestinatario: values[headers.indexOf('CIDADE DO DESTINATÁRIO')] || '',
            ruaDestinatario: values[headers.indexOf('RUA DO DESTINATÁRIO')] || '',
            cepDestinatario: values[headers.indexOf('CEP DO DESTINATÁRIO')] || '',
            complementoDestinatario: values[headers.indexOf('COMPLEMENTO DO DESTINATÁRIO')] || '',
            bairroDestinatario: values[headers.indexOf('BAIRRO DO DESTINATÁRIO')] || '',
            numeroEnderecoDestinatario: values[headers.indexOf('NÚMERO DO ENDEREÇO DO DESTINATÁRIO')] || '',
            dataEstimadaChegada: values[headers.indexOf('DATA ESTIMADA DE CHEGADA')] || '',
            codigoAfiliado: values[headers.indexOf('CÓDIGO DO AFILIADO')] || '',
            nomeAfiliado: values[headers.indexOf('NOME DO AFILIADO')] || '',
            emailAfiliado: values[headers.indexOf('E-MAIL DO AFILIADO')] || '',
            documentoAfiliado: values[headers.indexOf('DOCUMENTO DO AFILIADO')] || '',
            dataRecebimento: values[headers.indexOf('DATA DE RECEBIMENTO')] || '',
            dataNegociacao: values[headers.indexOf('Data_Negociacao')] || '',
            formaPagamento: values[headers.indexOf('FormaPagamento')] || '',
            documentoCliente: values[headers.indexOf('DOCUMENTO CLIENTE')] || '',
            parcial: values[headers.indexOf('Parcial')]?.toLowerCase() === 'sim',
            pagamentoParcial: parseFloat(values[headers.indexOf('Pagamento_Parcial')]?.replace('R$', '').replace('.', '').replace(',', '.').trim() || '0'),
            formaPagamentoParcial: values[headers.indexOf('FormaPagamentoParcial')] || '',
            dataPagamentoParcial: values[headers.indexOf('DataPagamentoParcial')] || ''
          };

          orders.push(order);
        }

        if (orders.length === 0) {
          throw new Error('Nenhum pedido válido encontrado no arquivo');
        }

        if (problematicLines.length > 0) {
          setError(
            `Foram encontrados ${skippedLines} linhas com problemas:\n\n` +
            `Linhas com campos obrigatórios ausentes:\n` +
            problematicLines.map(line => `Linha ${line}`).join('\n') + '\n\n' +
            `Campos obrigatórios:\n` +
            `- ID Venda\n` +
            `- Cliente\n` +
            `- Valor Venda\n\n` +
            `Verifique se:\n` +
            `1. Todos os campos obrigatórios estão preenchidos\n` +
            `2. Não há linhas em branco no meio do arquivo\n` +
            `3. Os separadores (tabs) estão corretos\n` +
            `4. Não há caracteres especiais ou quebras de linha dentro dos campos`
          );
        }

        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + (order.valorVenda || 0), 0);

        setPreviewData({
          headers,
          orders,
          totalSales,
          skippedLines,
          problematicLines
        });
        setShowPreview(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (previewData) {
      try {
        // Os dados já estão no formato Order, então podemos passá-los diretamente
        // sem a conversão complexa que estava causando o problema
        onImportSuccess(previewData.orders);
        
        // Limpar o estado após importação bem-sucedida
        setShowPreview(false);
        setPreviewData(null);
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Import error:', err);
        setError('Erro ao importar os pedidos: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        type="file"
        accept=".csv,.tsv,.txt"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={handleClick}
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
      </Button>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Prévia da Importação</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total de Vendas: R$ {previewData?.totalSales.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Número de Pedidos: {previewData?.orders.length}
            </Typography>
            {previewData && previewData.skippedLines > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {previewData.skippedLines} linhas foram ignoradas devido a campos obrigatórios ausentes
              </Alert>
            )}
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {previewData?.headers.map((header, index) => (
                      <TableCell key={index}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData?.orders.slice(0, 5).map((order, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {previewData.headers.map((header, colIndex) => {
                        // Map CSV headers to Order properties
                        const value = (() => {
                          switch (header) {
                            case 'Data Venda':
                              return order.dataVenda;
                            case 'ID Venda':
                              return order.idVenda;
                            case 'Cliente':
                              return order.cliente;
                            case 'Telefone':
                              return order.telefone;
                            case 'Oferta':
                              return order.oferta;
                            case 'Valor Venda':
                              return order.valorVenda;
                            case 'Status':
                              return order.status;
                            case 'Situação Venda':
                              return order.situacaoVenda;
                            case 'Valor Recebido':
                              return order.valorRecebido;
                            case 'Historico':
                              return order.historico;
                            case 'Ultima Atualização':
                              return order.ultimaAtualizacao;
                            case 'Código de Rastreio':
                              return order.codigoRastreio;
                            case 'Status Correios':
                              return order.statusCorreios;
                            case 'Vendedor':
                              return order.vendedor;
                            case 'Operador':
                              return order.operador;
                            case 'Zap':
                              return order.zap;
                            case 'ESTADO DO DESTINATÁRIO':
                              return order.estadoDestinatario;
                            case 'CIDADE DO DESTINATÁRIO':
                              return order.cidadeDestinatario;
                            case 'RUA DO DESTINATÁRIO':
                              return order.ruaDestinatario;
                            case 'CEP DO DESTINATÁRIO':
                              return order.cepDestinatario;
                            case 'COMPLEMENTO DO DESTINATÁRIO':
                              return order.complementoDestinatario;
                            case 'BAIRRO DO DESTINATÁRIO':
                              return order.bairroDestinatario;
                            case 'NÚMERO DO ENDEREÇO DO DESTINATÁRIO':
                              return order.numeroEnderecoDestinatario;
                            case 'DATA ESTIMADA DE CHEGADA':
                              return order.dataEstimadaChegada;
                            case 'CÓDIGO DO AFILIADO':
                              return order.codigoAfiliado;
                            case 'NOME DO AFILIADO':
                              return order.nomeAfiliado;
                            case 'E-MAIL DO AFILIADO':
                              return order.emailAfiliado;
                            case 'DOCUMENTO DO AFILIADO':
                              return order.documentoAfiliado;
                            case 'DATA DE RECEBIMENTO':
                              return order.dataRecebimento;
                            case 'Data_Negociacao':
                              return order.dataNegociacao;
                            case 'FormaPagamento':
                              return order.formaPagamento;
                            case 'DOCUMENTO CLIENTE':
                              return order.documentoCliente;
                            case 'Parcial':
                              return order.parcial ? 'Sim' : 'Não';
                            case 'Pagamento_Parcial':
                              return order.pagamentoParcial;
                            case 'FormaPagamentoParcial':
                              return order.formaPagamentoParcial;
                            case 'DataPagamentoParcial':
                              return order.dataPagamentoParcial;
                            default:
                              return '';
                          }
                        })();

                        return (
                          <TableCell key={colIndex}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {previewData && previewData.orders.length > 5 && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Mostrando 5 de {previewData.orders.length} pedidos
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirmImport}
            variant="contained"
            color="primary"
          >
            Confirmar Importação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CSVImport; 