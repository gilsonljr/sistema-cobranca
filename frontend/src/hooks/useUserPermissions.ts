import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

/**
 * Hook personalizado para gerenciar permissões e papéis de usuário
 * Centraliza a lógica de verificação de permissões para reutilização em componentes
 */
export const useUserPermissions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isCollector, setIsCollector] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    // Verificar papéis de usuário
    setIsAdmin(AuthService.isAdmin());
    setIsSupervisor(AuthService.isSupervisor());
    setIsCollector(AuthService.isCollector());
    setIsSeller(AuthService.isSeller());
    
    // Obter informações do usuário
    const userInfo = AuthService.getUserInfo();
    if (userInfo) {
      setCurrentUserName(userInfo.fullName);
      setCurrentUserEmail(userInfo.email);
    }
  }, []);

  /**
   * Verifica se o usuário tem permissão para ver um pedido com base em seu papel
   * @param vendedor O nome do vendedor do pedido
   * @param operador O nome do operador do pedido
   * @returns Verdadeiro se o usuário tem permissão para ver o pedido
   */
  const canViewOrder = (vendedor?: string, operador?: string): boolean => {
    // Admins e supervisores podem ver todos os pedidos
    if (isAdmin || isSupervisor) return true;
    
    // Vendedores podem ver apenas seus próprios pedidos
    if (isSeller) {
      return vendedor === currentUserName || vendedor === currentUserEmail;
    }
    
    // Operadores podem ver apenas pedidos atribuídos a eles
    if (isCollector) {
      return operador === currentUserName || operador === currentUserEmail;
    }
    
    return false;
  };

  /**
   * Verifica se o usuário pode deletar pedidos
   * @returns Verdadeiro se o usuário tem permissão para deletar pedidos
   */
  const canDeleteOrders = (): boolean => {
    // Apenas administradores podem deletar pedidos
    return isAdmin;
  };

  /**
   * Verifica se o usuário pode ver pedidos deletados
   * @returns Verdadeiro se o usuário tem permissão para ver pedidos deletados
   */
  const canViewDeletedOrders = (): boolean => {
    // Apenas administradores podem ver pedidos deletados
    return isAdmin;
  };

  /**
   * Filtra uma lista de pedidos com base nas permissões do usuário atual
   * @param orders Lista de pedidos a ser filtrada
   * @param includeDeleted Se deve incluir pedidos deletados na lista
   * @returns Lista de pedidos filtrada
   */
  const filterOrdersByPermission = (orders: any[], includeDeleted: boolean = false): any[] => {
    return orders.filter(order => {
      // Filtrar pedidos deletados se não estiver explicitamente incluindo-os
      if (!includeDeleted && !canViewDeletedOrders()) {
        if (order.situacaoVenda?.toLowerCase() === 'deletado') {
          return false;
        }
      }
      
      // Filtrar com base no papel do usuário
      return canViewOrder(order.vendedor, order.operador);
    });
  };

  return {
    isAdmin,
    isSupervisor,
    isCollector,
    isSeller,
    currentUserName,
    currentUserEmail,
    canViewOrder,
    canDeleteOrders,
    canViewDeletedOrders,
    filterOrdersByPermission
  };
};

export default useUserPermissions; 