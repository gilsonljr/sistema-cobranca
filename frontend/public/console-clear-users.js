/**
 * Script para limpar todos os usuários exceto o admin
 * 
 * Este script pode ser executado diretamente no console do navegador
 * para limpar todos os usuários do sistema, mantendo apenas o admin.
 * 
 * Uso:
 * 1. Abra o console do navegador (F12 ou Ctrl+Shift+I)
 * 2. Cole este script no console
 * 3. Pressione Enter para executar
 */

// Função para limpar todos os usuários exceto o admin
(function() {
    try {
        console.log('Iniciando limpeza de usuários...');
        
        // 1. Criar usuário admin
        const adminUser = {
            id: 1,
            nome: "Admin",
            email: "admin@sistema.com",
            papeis: ["admin"],
            permissoes: ["criar_usuario", "editar_usuario", "excluir_usuario", "ver_relatorios", "editar_configuracoes", "ver_todos_pedidos", "editar_pedidos"],
            ativo: true
        };
        
        // 2. Limpar e definir usuários no contexto principal
        console.log('Limpando usuários do contexto principal...');
        localStorage.setItem('users', JSON.stringify([adminUser]));
        
        // 3. Limpar e definir usuários no sistema de emergência
        console.log('Limpando usuários do sistema de emergência...');
        const defaultUsers = {
            'admin@sistema.com': {
                id: 1,
                email: 'admin@sistema.com',
                fullName: 'Admin',
                role: 'admin',
                password: 'admin123'
            }
        };
        localStorage.setItem('default_users', JSON.stringify(defaultUsers));
        
        // 4. Limpar e definir mock users
        console.log('Limpando mock users...');
        localStorage.setItem('mockUsers', JSON.stringify([{
            id: 1,
            nome: "Admin",
            email: "admin@sistema.com",
            perfil: "Administrador",
            ativo: true
        }]));
        
        // 5. Limpar e definir senhas
        console.log('Limpando senhas de usuários...');
        const adminPasswords = {
            'admin@sistema.com': 'admin123'
        };
        localStorage.setItem('user_passwords', JSON.stringify(adminPasswords));
        
        // 6. Verificar e limpar todos os armazenamentos de usuários
        console.log('Verificando todos os armazenamentos de usuários...');
        
        // Lista de chaves específicas de usuários que verificamos explicitamente
        const checkedUserKeys = ['users', 'default_users', 'user_passwords', 'mockUsers', 'userInfo'];
        
        // Remover quaisquer outros armazenamentos de usuários
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('user') ||
                key.includes('User') ||
                key.includes('usuario') ||
                key.includes('Usuario') ||
                key.includes('perfil') ||
                key.includes('Perfil') ||
                key.includes('role') ||
                key.includes('Role') ||
                key.includes('admin') ||
                key.includes('Admin')
            )) {
                // Verificar se não é uma das chaves que já tratamos explicitamente
                if (!checkedUserKeys.includes(key)) {
                    // Limpar ou definir para um array vazio
                    localStorage.setItem(key, JSON.stringify([]));
                    console.log(`Limpando armazenamento adicional de usuários: ${key}`);
                }
            }
        }
        
        // 7. Disparar eventos para notificar a aplicação
        console.log('Disparando eventos para notificar a aplicação...');
        
        // Criar e disparar eventos
        window.dispatchEvent(new CustomEvent('user-data-reset', { detail: { users: [adminUser] } }));
        window.dispatchEvent(new CustomEvent('user-list-reset'));
        
        console.log('Limpeza concluída! Todos os usuários foram removidos, exceto o Admin.');
        console.log('Recarregue a página para ver as alterações.');
        
        // Forçar recarga da página após 2 segundos
        console.log('A página será recarregada em 2 segundos...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
        return "Limpeza concluída com sucesso!";
    } catch (error) {
        console.error('Erro durante a limpeza:', error);
        return "Erro durante a limpeza: " + error.message;
    }
})();
