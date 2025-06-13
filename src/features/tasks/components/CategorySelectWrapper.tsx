

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  catagoryType,
  getAllTaskCatagories,
} from "@/features/tasks/server/action";

export function CategorySelectWrapper() {
  const [categories, setCategories] = useState<catagoryType>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllTaskCatagories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Select name="category" required disabled={loading}>
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? "Loading..." : "Choose a category"}
        />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="loading" disabled>
            Loading...
          </SelectItem>
        ) : (
          categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
