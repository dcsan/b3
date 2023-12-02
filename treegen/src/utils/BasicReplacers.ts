export type ReplaceItem = [RegExp, string]

export const basicReplacers: ReplaceItem[] = [
  [/Tersic/gim, "Tercek"],
  [/Tersik/gim, "Tercek"],
  [/Tersek/gim, "Tercek"],
  [/Tercekk/gim, "Tercek"],
  [/Tersick/gim, "Tercek"],
  [/Jim Ruth/gim, "Jim Rutt"],
  [/Jim Rut /gim, "Jim Rutt "], // space to avoid Rutt -> Ruttt
  [/Jim Rutchow/gim, "Jim Rutt Show"],
  [/Frank Lance/gim, "Frank Lantz"],
]
