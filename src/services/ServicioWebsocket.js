import "react-use-websocket";

export const WebsocketEvents = Object.freeze({
  WINNER: "WINNER",
  PLAYER_JOIN: "PLAYER_JOIN",
  PLAYER_LEFT: "PLAYER_LEFT",
  END_PLAYER_TURN: "END_PLAYER_TURN",
  START_MATCH: "START_MATCH",
  UNDO_PARTIAL_MOVE: "UNDO_PARTIAL_MOVE",
  COMPLETED_FIGURE: "COMPLETED_FIGURE",
  PLAYER_RECEIVE_NEW_BOARD: "PLAYER_RECEIVE_NEW_BOARD",
  MATCHES_LIST: "MATCHES_LIST"
});
