# Guia de Instalação do Recharts

Este guia fornece instruções detalhadas para instalar a biblioteca Recharts, necessária para os relatórios avançados do sistema.

## O que é Recharts?

Recharts é uma biblioteca de gráficos para React baseada em D3.js. Ela permite criar visualizações de dados interativas e responsivas com facilidade.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (normalmente instalado com o Node.js)
- Acesso à internet para baixar os pacotes

## Instruções de Instalação

### Método 1: Usando npm

1. Abra um terminal ou prompt de comando
2. Navegue até o diretório raiz do projeto frontend:
   ```
   cd C:\Users\Gilson\Desktop\WOLF\Sistema\frontend
   ```
3. Execute o comando de instalação:
   ```
   npm install --save recharts @types/recharts
   ```
4. Aguarde a conclusão da instalação
5. Reinicie o servidor de desenvolvimento (se estiver em execução)

### Método 2: Usando yarn (alternativa)

Se você estiver usando yarn em vez de npm:

1. Abra um terminal ou prompt de comando
2. Navegue até o diretório raiz do projeto frontend:
   ```
   cd C:\Users\Gilson\Desktop\WOLF\Sistema\frontend
   ```
3. Execute o comando de instalação:
   ```
   yarn add recharts @types/recharts
   ```

### Método 3: Instalação Manual (se os métodos acima falharem)

Se você estiver enfrentando problemas com npm ou yarn, pode tentar uma abordagem manual:

1. Baixe os arquivos do Recharts do repositório oficial:
   - Visite https://github.com/recharts/recharts/releases
   - Baixe a versão mais recente (arquivo ZIP)

2. Extraia os arquivos para uma pasta temporária

3. Copie a pasta `dist` para o diretório `node_modules/recharts` do seu projeto

4. Adicione a dependência ao seu package.json manualmente:
   ```json
   "dependencies": {
     "recharts": "^2.5.0",
     "@types/recharts": "^1.8.24"
   }
   ```

## Verificando a Instalação

Para verificar se o Recharts foi instalado corretamente:

1. Abra um terminal ou prompt de comando
2. Navegue até o diretório raiz do projeto frontend
3. Execute o comando:
   ```
   npm list recharts
   ```
4. Você deve ver algo como:
   ```
   └── recharts@2.5.0
   ```

## Solução de Problemas

### Erro: "Module not found: Error: Can't resolve 'recharts'"

Este erro ocorre quando o Recharts não está instalado ou não está acessível. Tente:

1. Verificar se a instalação foi concluída sem erros
2. Limpar o cache do npm:
   ```
   npm cache clean --force
   ```
3. Reinstalar o Recharts:
   ```
   npm install --save recharts @types/recharts
   ```

### Erro: "Cannot find module 'recharts' or its corresponding type declarations"

Este erro ocorre quando os tipos TypeScript para o Recharts não estão disponíveis. Tente:

1. Instalar explicitamente os tipos:
   ```
   npm install --save-dev @types/recharts
   ```

### Erro: "Dependency tree is broken"

Se você encontrar erros relacionados à árvore de dependências:

1. Tente reinstalar todas as dependências:
   ```
   rm -rf node_modules
   npm install
   ```

## Alternativas ao Recharts

Se você continuar enfrentando problemas com o Recharts, considere estas alternativas:

1. **Chart.js** com **react-chartjs-2**:
   ```
   npm install chart.js react-chartjs-2
   ```

2. **Victory**:
   ```
   npm install victory
   ```

3. **Nivo**:
   ```
   npm install @nivo/core @nivo/bar @nivo/line @nivo/pie
   ```

## Suporte

Se você continuar enfrentando problemas, consulte:

- [Documentação oficial do Recharts](https://recharts.org/en-US/)
- [Repositório do Recharts no GitHub](https://github.com/recharts/recharts)
- [Stack Overflow - Tag Recharts](https://stackoverflow.com/questions/tagged/recharts)
