import React, { FC } from "react";
import { TagSuggestion } from "./types";

interface SuggestionsProps {
  items: TagSuggestion[];
  onItemPress: (selectedSuggestion: TagSuggestion) => void;
}

export const Suggestions: FC<SuggestionsProps> = ({ items, onItemPress }) => {
  return (
    <div
      style={
        {
          maxHeight: 300,
          top: 20,
            left: 0,
            right: 0,
            backgroundColor: "white",
            position: "absolute",
        }}
    >
      <div>
        {items.map(({ id, name }) => (
          <div
            key={id}
            onClick={() => onItemPress({ id, name })}
            style={{
              backgroundColor: "lightcyan",
              padding: "10px",
              cursor: 'pointer'
            }}
          >
            <div >
              <span>
                {name.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
