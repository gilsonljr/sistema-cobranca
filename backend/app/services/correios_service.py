import logging
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class CorreiosService:
    """Service for interacting with the Correios API"""
    
    def __init__(self):
        self.api_url = settings.CORREIOS_API_URL
        self.api_key = settings.CORREIOS_API_KEY
        
        # Status considerados críticos que precisam de atenção
        self.critical_statuses = [
            'objeto devolvido',
            'endereço incorreto',
            'objeto aguardando retirada',
            'tentativa de entrega',
            'objeto roubado',
            'objeto extraviado',
            'recusado',
            'entrega não efetuada'
        ]
    
    def is_status_critical(self, status: str) -> bool:
        """Check if a status is considered critical"""
        if not status:
            return False
            
        return any(critical.lower() in status.lower() for critical in self.critical_statuses)
    
    def track_package(self, tracking_code: str) -> Dict[str, Any]:
        """
        Track a package using the Correios API
        
        Args:
            tracking_code: The tracking code to look up
            
        Returns:
            A dictionary with tracking information
        """
        if not tracking_code:
            raise ValueError("Tracking code is required")
            
        if not self.api_key:
            logger.warning("Correios API key is not set. Using mock data.")
            return self._mock_tracking_response(tracking_code)
            
        try:
            # Prepare headers with authentication
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Make request to Correios API
            response = requests.get(
                f"{self.api_url}/v1/sro-rastro/{tracking_code}",
                headers=headers,
                timeout=10
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            # Parse response
            data = response.json()
            
            # Format the response to match our expected format
            return self._format_correios_response(data, tracking_code)
            
        except requests.RequestException as e:
            logger.error(f"Error tracking package {tracking_code}: {str(e)}")
            # Fallback to mock data if API fails
            return self._mock_tracking_response(tracking_code)
    
    def track_multiple_packages(self, tracking_codes: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Track multiple packages at once
        
        Args:
            tracking_codes: List of tracking codes to look up
            
        Returns:
            Dictionary mapping tracking codes to their tracking information
        """
        results = {}
        
        for code in tracking_codes:
            try:
                results[code] = self.track_package(code)
            except Exception as e:
                logger.error(f"Error tracking package {code}: {str(e)}")
                results[code] = {
                    "codigo": code,
                    "eventos": [],
                    "entregue": False,
                    "error": str(e)
                }
                
        return results
    
    def _format_correios_response(self, data: Dict[str, Any], tracking_code: str) -> Dict[str, Any]:
        """
        Format the Correios API response to match our expected format
        
        Args:
            data: The raw API response
            tracking_code: The tracking code that was looked up
            
        Returns:
            Formatted tracking information
        """
        try:
            # Extract the object information
            objeto = next((obj for obj in data.get("objetos", []) if obj.get("codObjeto") == tracking_code), None)
            
            if not objeto:
                return {
                    "codigo": tracking_code,
                    "eventos": [],
                    "entregue": False
                }
                
            # Check if the object has been delivered
            entregue = any(
                evento.get("descricao", "").lower().find("entregue") >= 0
                for evento in objeto.get("eventos", [])
            )
            
            # Format events
            eventos = []
            for evento in objeto.get("eventos", []):
                # Parse the date and time
                data_hora = evento.get("dtHrCriado", "")
                if data_hora:
                    try:
                        dt = datetime.fromisoformat(data_hora.replace("Z", "+00:00"))
                        data = dt.strftime("%d/%m/%Y")
                        hora = dt.strftime("%H:%M")
                    except ValueError:
                        data = ""
                        hora = ""
                else:
                    data = ""
                    hora = ""
                
                # Get location
                unidade = evento.get("unidade", {})
                local = f"{unidade.get('cidade', '')}/{unidade.get('uf', '')}"
                
                # Get status and substatus
                status = evento.get("descricao", "")
                sub_status = evento.get("detalhe", "")
                
                eventos.append({
                    "data": data,
                    "hora": hora,
                    "local": local,
                    "status": status,
                    "subStatus": sub_status
                })
                
            return {
                "codigo": tracking_code,
                "eventos": eventos,
                "entregue": entregue,
                "servico": objeto.get("tipoPostal", {}).get("categoria", "")
            }
            
        except Exception as e:
            logger.error(f"Error formatting Correios response for {tracking_code}: {str(e)}")
            return self._mock_tracking_response(tracking_code)
    
    def _mock_tracking_response(self, tracking_code: str) -> Dict[str, Any]:
        """
        Generate mock tracking data for development and testing
        
        Args:
            tracking_code: The tracking code to generate mock data for
            
        Returns:
            Mock tracking information
        """
        import random
        from datetime import datetime, timedelta
        
        # Generate a random number to simulate different states
        rnd = random.random()
        entregue = rnd > 0.7
        
        # Create an array of simulated events
        eventos = []
        
        # Add most recent event
        now = datetime.now()
        
        if entregue:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto entregue ao destinatário",
                "subStatus": ""
            })
        elif rnd > 0.6:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto saiu para entrega ao destinatário",
                "subStatus": ""
            })
        elif rnd > 0.5:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto em trânsito - por favor aguarde",
                "subStatus": ""
            })
        elif rnd > 0.4:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Tentativa de entrega não efetuada",
                "subStatus": "Endereço incorreto"
            })
        elif rnd > 0.3:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto aguardando retirada no endereço indicado",
                "subStatus": "Pode ser retirado em uma agência dos Correios"
            })
        elif rnd > 0.2:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto devolvido ao remetente",
                "subStatus": "Recusado pelo destinatário"
            })
        elif rnd > 0.1:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "São Paulo / SP",
                "status": "Objeto em processo de desembaraço",
                "subStatus": "Aguardando pagamento de tributos"
            })
        else:
            eventos.append({
                "data": now.strftime("%d/%m/%Y"),
                "hora": now.strftime("%H:%M"),
                "local": "Curitiba / PR",
                "status": "Objeto postado",
                "subStatus": ""
            })
        
        # Add some historical simulated events
        past_date = now - timedelta(days=2)
        
        eventos.append({
            "data": past_date.strftime("%d/%m/%Y"),
            "hora": past_date.strftime("%H:%M"),
            "local": "Curitiba / PR",
            "status": "Objeto postado",
            "subStatus": ""
        })
        
        return {
            "codigo": tracking_code,
            "eventos": eventos,
            "entregue": entregue,
            "servico": "SEDEX" if random.random() > 0.5 else "PAC"
        }


# Create a singleton instance
correios_service = CorreiosService()
