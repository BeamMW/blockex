export interface BeamWalletStatusResponse {
  available: number;
  current_height: number;
  current_state_hash: string;
  current_state_timestamp: number;
  difficulty: number;
  is_in_sync: boolean;
  maturing: number;
  prev_state_hash: string;
  receiving: number;
  sending: number;
}
