// Call of Blades — React Game Base with Dextrous JSON support

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameCard {
  id: number;
  name: string;
  effect: string;
  image?: string;
}

export default function CallOfBladesApp() {
  const [hand, setHand] = useState<GameCard[]>([]);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch("/CoB%202.4%20ALL%20New%20named%203-08-25.json"); // TTS JSON from Dextrous
        const rawData = await response.json();

        const dextrousCards: GameCard[] = [];
        const deckMap: Record<string, string> = {};

        for (const obj of rawData.ObjectStates || []) {
          const deck = obj.CustomDeck || {};
          for (const key in deck) {
            deckMap[key] = deck[key].FaceURL?.replace("{verifycache}", "") || "";
          }

          const contained = obj.ContainedObjects || [];
          for (let i = 0; i < contained.length; i++) {
            const c = contained[i];
            const cardId = c.CardID?.toString() || "";
            const deckPrefix = cardId.substring(0, 1);
            dextrousCards.push({
              id: i + 1,
              name: c.Nickname || `Card ${i + 1}`,
              effect: "Effect from TTS", // можно заменить, если появится описание
              image: deckMap[deckPrefix] || undefined,
            });
          }
        }

        setHand(dextrousCards.slice(0, 5));
      } catch (error) {
        console.error("Ошибка загрузки карт из Dextrous JSON:", error);
      }
    }

    loadCards();
  }, []);

  const playCard = (card: GameCard) => {
    setLog((prev) => [...prev, `Played ${card.name}: ${card.effect}`]);
    setHand((prev) => prev.filter((c) => c.id !== card.id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Call of Blades (React + Dextrous)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hand.map((card) => (
          <Card key={card.id} className="cursor-pointer hover:shadow-lg" onClick={() => playCard(card)}>
            <CardContent className="space-y-2">
              {card.image && (
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full rounded border border-muted shadow"
                />
              )}
              <h2 className="text-xl font-semibold">{card.name}</h2>
              <p className="text-sm text-muted-foreground">{card.effect}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-lg font-bold">Action Log:</h2>
        <ul className="bg-muted p-4 rounded space-y-1 text-sm">
          {log.map((entry, idx) => (
            <li key={idx}>• {entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
