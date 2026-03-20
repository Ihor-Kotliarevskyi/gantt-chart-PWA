import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Modal } from "../Modal";
import type { Category } from "../../types";

const CAT_PALETTE = [
  "#2cd134",
  "#268cd4",
  "#e97f3e",
  "#ec3030",
  "#929292",
  "#ce9300",
  "#008ecf",
  "#9e6cf5",
  "#0bb8e4",
  "#ec3582",
  "#86d814",
  "#eb7739",
  "#18ccbd",
  "#d36723",
  "#3566ee",
  "#db3175",
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentProject, currentId, setCategories } = useAppStore();
  const [tempCats, setTempCats] = useState<Category[]>([]);

  const initialCats = useMemo(
    () =>
      isOpen && currentProject
        ? [...currentProject.cats.map((c) => ({ ...c }))]
        : [],
    [isOpen, currentProject],
  );

  useEffect(() => {
    setTempCats(initialCats);
  }, [initialCats]);

  const handleSave = () => {
    setCategories(currentId, tempCats);
    onClose();
  };

  const addCat = () => {
    const usedColors = tempCats.map((c) => c.color);
    const color =
      CAT_PALETTE.find((c) => !usedColors.includes(c)) ||
      CAT_PALETTE[tempCats.length % CAT_PALETTE.length];
    setTempCats([...tempCats, { name: "Нова категорія", color }]);
  };

  const deleteCat = (index: number) => {
    // Ideally check if category is used in tasks before deleting
    if (currentProject?.tasks.some((t) => t.cat === index)) {
      if (!confirm("Ця категорія використовується в роботах. Видалити?"))
        return;
    }
    const next = [...tempCats];
    next.splice(index, 1);
    setTempCats(next);
  };

  const updateColor = (index: number, color: string) => {
    const next = [...tempCats];
    next[index].color = color;
    setTempCats(next);
  };

  const updateName = (index: number, name: string) => {
    const next = [...tempCats];
    next[index].name = name;
    setTempCats(next);
  };

  return (
    <Modal title="Редагування категорій" isOpen={isOpen} onClose={onClose}>
      <div className="cat-editor-list">
        {tempCats.map((cat, i) => (
          <div
            key={i}
            className="cat-row"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <div
                className="cat-swatch"
                style={{
                  background: cat.color,
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="color"
                  value={cat.color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  style={{
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div
                className="cat-palette"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "2px",
                  width: "100px",
                }}
              >
                {CAT_PALETTE.map((hex) => (
                  <div
                    key={hex}
                    className={`pal-dot ${cat.color === hex ? "active" : ""}`}
                    style={{
                      background: hex,
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      cursor: "pointer",
                      border: cat.color === hex ? "1px solid #000" : "none",
                    }}
                    onClick={() => updateColor(i, hex)}
                  />
                ))}
              </div>
            </div>
            <input
              className="cat-name-inp"
              value={cat.name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder="Назва категорії"
              style={{ flex: 1, padding: "6px", fontSize: "13px" }}
            />
            <span
              className="cat-del"
              onClick={() => deleteCat(i)}
              style={{ cursor: "pointer", color: "red" }}
            >
              ✕
            </span>
          </div>
        ))}
      </div>
      <button
        className="btn btn-acc"
        style={{ width: "100%", marginBottom: "10px" }}
        onClick={addCat}
      >
        + Додати категорію
      </button>
      <div className="m-btns">
        <button className="btn" onClick={onClose}>
          Скасувати
        </button>
        <button className="btn btn-acc" onClick={handleSave}>
          Зберегти
        </button>
      </div>
    </Modal>
  );
};
