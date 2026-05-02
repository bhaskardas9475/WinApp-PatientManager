import { useCallback, useEffect, useState } from "react";
import { execute, query, QueryResult } from "@/db";
import { Toast } from "@/components/Toast";

export interface UserRecord {
  id: number;
  name: string;
  phone: string;
  gender: string;
  comment: string;
}

export interface UserFormValues {
  name: string;
  phone: string;
  gender: string;
  comment: string;
}

const defaultFormValues: UserFormValues = {
  name: "",
  phone: "",
  gender: "Male",
  comment: "",
};

const escapeSqlValue = (value: string) => value.replace(/'/g, "''");

const mapUser = (row: QueryResult): UserRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  phone: String(row.phone ?? ""),
  gender: String(row.gender ?? ""),
  comment: String(row.comment ?? ""),
});

export const useAddUserController = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState<UserFormValues>(defaultFormValues);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await query(
        "SELECT id, name, phone, gender, comment FROM users ORDER BY id DESC",
      );
      setUsers(rows.map(mapUser));
    } catch (error) {
      Toast.error(`Unable to load users: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateField = useCallback(
    (field: keyof UserFormValues, value: string) => {
      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setForm(defaultFormValues);
    setEditingUserId(null);
    setFormVersion((current) => current + 1);
  }, []);

  const startEdit = useCallback((user: UserRecord) => {
    setForm({
      name: user.name,
      phone: user.phone,
      gender: user.gender || defaultFormValues.gender,
      comment: user.comment,
    });
    setEditingUserId(user.id);
    setFormVersion((current) => current + 1);
  }, []);

  const saveUser = useCallback(async () => {
    if (!form.name.trim()) {
      Toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const name = escapeSqlValue(form.name.trim());
      const phone = escapeSqlValue(form.phone.trim());
      const gender = escapeSqlValue(form.gender.trim());
      const comment = escapeSqlValue(form.comment.trim());

      if (editingUserId === null) {
        await execute(
          `INSERT INTO users (name, phone, gender, comment) VALUES ('${name}', '${phone}', '${gender}', '${comment}')`,
        );
      } else {
        await execute(
          `UPDATE users SET name='${name}', phone='${phone}', gender='${gender}', comment='${comment}' WHERE id=${editingUserId}`,
        );
      }

      resetForm();
      await loadUsers();
      Toast.success(
        `User ${editingUserId === null ? "added" : "updated"} successfully.`,
      );
    } catch (error) {
      Toast.error(`Unable to save user: ${String(error)}`);
    } finally {
      setSaving(false);
    }
  }, [editingUserId, form, loadUsers, resetForm]);

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        await execute(`DELETE FROM users WHERE id=${id}`);
        if (editingUserId === id) {
          resetForm();
        }
        await loadUsers();
        Toast.success("User deleted successfully.");
      } catch (error) {
        Toast.error(`Unable to delete user: ${String(error)}`);
      }
    },
    [editingUserId, loadUsers, resetForm],
  );

  return {
    users,
    form,
    loading,
    saving,
    editingUserId,
    formVersion,
    updateField,
    saveUser,
    deleteUser,
    startEdit,
    resetForm,
  };
};
