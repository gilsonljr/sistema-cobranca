/**
 * Script para resetar usuários usando o novo UserStore
 * 
 * Este script pode ser executado diretamente no console do navegador
 * para resetar todos os usuários do sistema, mantendo apenas o admin.
 * 
 * Uso:
 * 1. Abra o console do navegador (F12 ou Ctrl+Shift+I)
 * 2. Cole este script no console
 * 3. Pressione Enter para executar
 */

// Classe UserStore (versão simplificada para uso direto)
class UserStore {
    static STORAGE_KEY = 'system_users';
    
    static DEFAULT_ADMIN = {
        id: 1,
        nome: 'Admin',
        email: 'admin@sistema.com',
        papeis: ['admin'],
        permissoes: ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios', 'editar_configuracoes', 'ver_todos_pedidos', 'editar_pedidos'],
        ativo: true
    };
    
    static getUsers() {
        try {
            const storedUsers = localStorage.getItem(this.STORAGE_KEY);
            return storedUsers ? JSON.parse(storedUsers) : [this.DEFAULT_ADMIN];
        } catch (error) {
            console.error('UserStore: Erro ao obter usuários', error);
            return [this.DEFAULT_ADMIN];
        }
    }
    
    static saveUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            this.syncWithOtherStorages(users);
        } catch (error) {
            console.error('UserStore: Erro ao salvar usuários', error);
        }
    }
    
    static resetToAdmin() {
        this.saveUsers([this.DEFAULT_ADMIN]);
        return true;
    }
    
    static syncWithOtherStorages(users) {
        try {
            // 1. Sincronizar com 'users' (armazenamento antigo)
            localStorage.setItem('users', JSON.stringify(users));
            
            // 2. Sincronizar com 'default_users'
            const defaultUsers = {};
            users.forEach(user => {
                // Mapear papel para role
                let role = 'user';
                if (user.papeis.includes('admin')) role = 'admin';
                else if (user.papeis.includes('supervisor')) role = 'supervisor';
                else if (user.papeis.includes('collector') || user.papeis.includes('operador')) role = 'collector';
                else if (user.papeis.includes('seller') || user.papeis.includes('vendedor')) role = 'seller';
                
                defaultUsers[user.email] = {
                    id: user.id,
                    email: user.email,
                    fullName: user.nome,
                    role: role,
                    password: user.email === 'admin@sistema.com' ? 'admin123' : 'senha123'
                };
            });
            localStorage.setItem('default_users', JSON.stringify(defaultUsers));
            
            // 3. Sincronizar com 'mockUsers'
            const mockUsers = users.map(user => {
                // Determinar perfil
                let perfil = 'Usuário';
                if (user.papeis.includes('admin')) perfil = 'Administrador';
                else if (user.papeis.includes('supervisor')) perfil = 'Supervisor';
                else if (user.papeis.includes('collector') || user.papeis.includes('operador')) perfil = 'Operador';
                else if (user.papeis.includes('seller') || user.papeis.includes('vendedor')) perfil = 'Vendedor';
                
                return {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    perfil: perfil,
                    permissoes: user.permissoes,
                    ativo: user.ativo
                };
            });
            localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
            
            // 4. Sincronizar senhas
            const passwords = {};
            users.forEach(user => {
                passwords[user.email] = user.email === 'admin@sistema.com' ? 'admin123' : 'senha123';
            });
            localStorage.setItem('user_passwords', JSON.stringify(passwords));
            
            return true;
        } catch (error) {
            console.error('UserStore: Erro ao sincronizar com outros armazenamentos', error);
            return false;
        }
    }
}

// Executar o reset
(function() {
    try {
        console.log('Iniciando reset de usuários...');
        
        // Obter contagem atual de usuários
        const currentUsers = UserStore.getUsers();
        const userCount = currentUsers.length;
        
        // Resetar para apenas o admin
        const result = UserStore.resetToAdmin();
        
        if (result) {
            console.log(`Reset concluído! ${userCount - 1} usuários foram removidos.`);
            console.log('Apenas o usuário Admin permanece no sistema.');
            
            // Disparar eventos para notificar a aplicação
            window.dispatchEvent(new CustomEvent('user-data-reset', { 
                detail: { users: [UserStore.DEFAULT_ADMIN] } 
            }));
            window.dispatchEvent(new CustomEvent('user-list-reset'));
            
            // Forçar recarga da página após 2 segundos
            console.log('A página será recarregada em 2 segundos...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
            return "Reset concluído com sucesso!";
        } else {
            console.error('Erro durante o reset de usuários.');
            return "Erro durante o reset de usuários.";
        }
    } catch (error) {
        console.error('Erro durante o reset:', error);
        return "Erro durante o reset: " + error.message;
    }
})();
