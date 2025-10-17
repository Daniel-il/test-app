import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import styles from './UserDetails.module.scss';

interface User {
  createdAt: string;
  id: number;
  name: string;
  avatar: string;
}

export default function UserDetails() {
  const baseUrl = 'https://68ed6c2adf2025af780028aa.mockapi.io/mockapi/users';
  const { id } = useParams();
  const userId = useMemo(() => (id ? String(id) : ''), [id]);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios
      .get<User>(`${baseUrl}/${userId}`)
      .then(({ data }) => {
        setUser(data);
        setName(data.name || '');
        setAvatar(data.avatar || '');
      })
      .catch(() => setError('Не удалось загрузить пользователя'))
      .finally(() => setLoading(false));
  }, [userId]);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userId) return;
    if (!name.trim()) {
      setSaveError('Имя обязательно');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
  
    try {
      const payload = { ...user, name: name.trim(), avatar };
      const { data } = await axios.put<User>(`${baseUrl}/${userId}`, payload);
      setUser(data);
      setSaved(true);
    } catch {
      setSaveError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles['user-details']}>
        <div className={styles['user-details__loading']}>Загрузка…</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles['user-details']}>
        <div className={styles['user-details__error']}>{error || 'Пользователь не найден'}</div>
        <Link className={styles['user-details__back']} to="/users">← Назад к списку</Link>
      </div>
    );
  }

  return (
    <div className={styles['user-details']}>
      <div className={styles['user-details__header']}>
        <Link className={styles['user-details__back']} to="/users">← Пользователи</Link>
      </div>

      <div className={styles['user-details__content']}>
        <div className={styles['user-details__profile']}>
          <h1 className={styles['user-details__title']}>Детали пользователя</h1>
          <img className={styles['user-details__avatar']} src={user.avatar} alt="аватар" />
          <div className={styles['user-details__meta']}>
            <div className={styles['user-details__field']}>
              <span className={styles['user-details__field-label']}>Имя пользователя:</span>
              <span className={styles['user-details__field-value']}>{user.name}</span>
            </div>
            <div className={styles['user-details__field']}>
              <span className={styles['user-details__field-label']}>ID:</span>
              <span className={styles['user-details__field-value']}>{user.id}</span>
            </div>
            <div className={styles['user-details__field']}>
              <span className={styles['user-details__field-label']}>Создан:</span>
              <span className={styles['user-details__field-value']}>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <form className={styles['user-details__form']} onSubmit={handleSave}>
          <h3 className={styles['user-details__subtitle']}>Редактирование</h3>
          {saveError && <div className={styles['user-details__form-error']}>{saveError}</div>}
          {saved && <div className={styles['user-details__form-success']}>Сохранено</div>}
          <label className={styles['user-details__label']}>
            <span className={styles['user-details__label-text']}>Имя пользователя</span>
            <input className={styles['user-details__input']} placeholder="Например: Иван Петров" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={styles['user-details__label']}>
            <span className={styles['user-details__label-text']}>Ссылка на аватар</span>
            <input className={styles['user-details__input']} placeholder="https://..." value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </label>
          <div className={styles['user-details__actions']}>
            <button type="submit" className={styles['user-details__btn']} disabled={saving}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
