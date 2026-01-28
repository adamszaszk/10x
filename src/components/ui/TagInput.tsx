import React, { useState } from "react";
import { Badge } from "./badge";
import { Input } from "./input";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput = ({ value = [], onChange, placeholder, disabled }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !value.includes(trimmedInput)) {
      onChange([...value, trimmedInput]);
      setInputValue("");
    }
  };

  const removeTag = (indexAndTag: number) => {
    const newValue = value.filter((_, i) => i !== indexAndTag);
    onChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            disabled={disabled}
            className="hover:bg-muted p-0.5 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        className="flex-1 border-0 focus-visible:ring-0 p-0 h-auto min-w-[120px]"
        placeholder={value.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        disabled={disabled}
      />
    </div>
  );
};
