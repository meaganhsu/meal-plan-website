import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Multiselect from "multiselect-react-dropdown";
import "../styles/EditDish.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function EditDish({ isOpen, onClose, dish, onSaved, mode = "edit" }) {
    const isNew = mode === "create";

    const [form, setForm] = useState({
        name: "",
        cuisine: "asian",
        ingredients: [],
        preferences: [],
        lastEaten: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // predefined key ingredients
    const ingredientOptions = [
        { cat: "Ingredients", key: "red meat" },
        { cat: "Ingredients", key: "pork" },
        { cat: "Ingredients", key: "chicken" },
        { cat: "Ingredients", key: "seafood" },
        { cat: "Ingredients", key: "eggs" },
        { cat: "Ingredients", key: "bread" },
        { cat: "Ingredients", key: "noodles" },
        { cat: "Ingredients", key: "pasta" },
        { cat: "Ingredients", key: "rice" },
        { cat: "Ingredients", key: "soup" },
        { cat: "Ingredients", key: "vegetables" },
    ];

    // initialise form data when modal opens / mode changes
    useEffect(() => {
        if (!isOpen) return;

        // populating form with existing dish data for edits
        if (isNew) {
            setForm({    // resetting form for new dish
                name: "",
                cuisine: "asian",
                ingredients: [],
                preferences: [],
                lastEaten: "",
            });
        } else if (dish) {
            setForm({     // populate form for editing
                name: dish.name || "",
                cuisine: dish.cuisine || "asian",
                ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
                preferences: Array.isArray(dish.preferences) ? dish.preferences : [],
                lastEaten: dish.lastEaten || "",
            });
        }
    }, [dish, isNew, isOpen]);

    // close on esc
    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onClose();
        if (isOpen) document.addEventListener("keydown", onKeyDown);     // listener open when modal is open
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    // locking background scroll
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";     // disabling scroll on body
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    const updateForm = (value) => setForm((prev) => ({ ...prev, ...value }));

    // filter ingredients to only include those who match the selected filter ingredients
    const getSelectedIngredients = () => {
        return ingredientOptions.filter((option) =>
            form.ingredients.includes(option.key)
        );
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // validate a name is inputted
        if (!form.name.trim()) {
            alert("Please enter a dish name");
            return;
        }

        const dishData = {
            name: form.name.trim(),
            cuisine: form.cuisine,
            ingredients: form.ingredients,
            preferences: form.preferences,
            lastEaten: form.lastEaten,
        };

        try {
            setIsSaving(true);
            let res;

            if (isNew) {
                // create dish operation
                res = await fetch(`${API_URL}/record`, {      // creating new dish
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dishData),
                });
            } else {
                // update dish operation
                res = await fetch(`${API_URL}/record/${dish._id}`, {    // update existing dish
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dishData),
                });
            }

            if (!res.ok) throw new Error(`HTTP error ${res.status}`);

            const savedDish = await res.json();
            onSaved(savedDish);
        } catch (err) {
            console.error(`Failed to ${isNew ? 'create' : 'update'} dish:`, err);
            alert(`Failed to ${isNew ? 'create' : 'save'} dish. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;
    if (!isNew && !dish) return null;

    const modal = (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isNew ? "Create New Dish" : "Edit Dish"}</h3>
                    <button className="icon-button" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <form onSubmit={onSubmit} className="modal-body">
                    <div className="section">
                        <div className="field">
                            <label htmlFor="dish-name">Dish Name</label>
                            <input
                                type="text"
                                id="dish-name"
                                value={form.name}
                                onChange={(e) => updateForm({ name: e.target.value })}
                                required
                                autoFocus={isNew}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="cuisine">Cuisine</label>
                            <select
                                id="cuisine"
                                value={form.cuisine}
                                onChange={(e) => updateForm({ cuisine: e.target.value })}
                            >
                                <option value="asian">Asian</option>
                                <option value="chinese">Chinese</option>
                                <option value="japanese">Japanese</option>
                                <option value="western">Western</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Ingredients</label>
                            <Multiselect
                                displayValue="key"
                                options={ingredientOptions}
                                selectedValues={getSelectedIngredients()}
                                onSelect={(list) => updateForm({ ingredients: list.map((i) => i.key) })}
                                onRemove={(list) => updateForm({ ingredients: list.map((i) => i.key) })}
                                placeholder="Select ingredients"
                                showCheckbox={true}
                            />
                        </div>

                        <div className="field">
                            <label>Preferences</label>
                            <div className="prefs-row">
                                {["Hubert", "Cherry", "Haley", "Ryan", "Meagan"].map((member) => {
                                    const memberKey = member.toLowerCase();
                                    const isChecked = Array.isArray(form.preferences) && form.preferences.includes(memberKey);
                                    return (
                                        <label key={memberKey} className={`pref-pill ${isChecked ? "checked" : ""}`}>
                                            <input
                                                type="checkbox"
                                                value={memberKey}
                                                checked={isChecked}
                                                onChange={() => {
                                                    const updated = isChecked
                                                        ? form.preferences.filter((p) => p !== memberKey)
                                                        : [...form.preferences, memberKey];
                                                    updateForm({ preferences: updated });
                                                }}
                                            />
                                            <span>{member.charAt(0).toUpperCase() + member.slice(1)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn secondary" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary" disabled={isSaving}>
                            {isSaving ? "Saving..." : (isNew ? "Create Dish" : "Update Dish")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const target = document.getElementById("modal-root") || document.body;
    return createPortal(modal, target);
}