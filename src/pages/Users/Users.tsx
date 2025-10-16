import { Link } from 'react-router-dom'
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import styles from './Users.module.scss';

interface User {
  createdAt: string;
  id: number;
  name: string;
  avatar: string;
}

export default function Users()  {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<User[]>('https://68ed6c2adf2025af780028aa.mockapi.io/mockapi/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить пользователей');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
    if (currentPage > total) setCurrentPage(total);
  }, [users, currentPage]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(users.length / PAGE_SIZE)), [users]);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentUsers = useMemo(() => users.slice(startIndex, startIndex + PAGE_SIZE), [users, startIndex]);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const gotoPage = (p: number) => setCurrentPage(p);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  };

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('…');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormAvatar('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name || '');
    setFormAvatar(u.avatar || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError('Имя обязательно');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const baseUrl = 'https://68ed6c2adf2025af780028aa.mockapi.io/mockapi/users';
      if (editingUser) {
        const payload = { ...editingUser, name: formName.trim(), avatar: formAvatar };
        const { data } = await axios.put<User>(`${baseUrl}/${editingUser.id}`, payload);
        setUsers(prev => prev.map(u => (u.id === data.id ? data : u)));
      } else {
        const payload = { name: formName.trim(), avatar: formAvatar, createdAt: new Date().toISOString() } as Omit<User, 'id'> as any;
        const { data } = await axios.post<User>(baseUrl, payload);
        setUsers(prev => [data, ...prev]);
      }
      setIsModalOpen(false);
    } catch {
      setModalError('Не удалось сохранить пользователя');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.users}>
        <div className={styles['users__loading']}>Загрузка пользователей…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.users}>
        <div className={styles['users__error']}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.users}>
      <div className={styles['users__header']}>
        <h1 className={styles['users__title']}>Пользователи</h1>
        <div className={styles['users__meta']}>
          <span>{users.length} всего</span>
          <span>Стр. {currentPage} / {totalPages}</span>
        </div>
      </div>

      <div className={styles['users__toolbar']}>
        <button className={styles['users__btn']} onClick={openCreate}>Создать пользователя</button>
      </div>

      <div className={styles['users__table-wrap']}>
        <table className={styles['users__table']}>
          <thead className={styles['users__thead']}>
            <tr className={styles['users__row']}>
              <th className={styles['users__th']}>Аватар</th>
              <th className={styles['users__th']}>Имя</th>
              <th className={styles['users__th']}>Создан</th>
              <th className={styles['users__th']} style={{ width: 120 }}>Действия</th>
            </tr>
          </thead>
          <tbody className={styles['users__tbody']}>
            {currentUsers.map((u) => (
              <tr key={u.id} className={styles['users__row']}>
                <td className={styles['users__td']}>
                  <img className={styles['users__avatar']} src={u.avatar} alt="аватар" />
                </td>
                <td className={styles['users__td']}>
                  <Link to={`/users/${u.id}`}>{u.name}</Link>
                </td>
                <td className={styles['users__td']}>{formatDate(u.createdAt)}</td>
                <td className={`${styles['users__td']} ${styles['users__actions']}`}>
                  <button className={styles['users__btn--ghost']} onClick={() => openEdit(u)}>Изменить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={styles['users__pagination']} aria-label="Пагинация пользователей">
          <button className={styles['users__page-button']} onClick={() => gotoPage(1)} disabled={currentPage === 1}>
            «
          </button>
          <button className={styles['users__page-button']} onClick={handlePrev} disabled={currentPage === 1}>
            ‹
          </button>

          {getPageNumbers().map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={p}
                className={`${styles['users__page-button']} ${currentPage === p ? styles['users__page-button--active'] : ''}`}
                onClick={() => gotoPage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className={styles['users__ellipsis']} aria-hidden>
                {p}
              </span>
            )
          ))}

          <button className={styles['users__page-button']} onClick={handleNext} disabled={currentPage === totalPages}>
            ›
          </button>
          <button className={styles['users__page-button']} onClick={() => gotoPage(totalPages)} disabled={currentPage === totalPages}>
            »
          </button>
        </nav>
      )}
      {isModalOpen && (
        <div className={styles['users__modal-backdrop']} onClick={closeModal}>
          <div className={styles['users__modal']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['users__modal-header']}>
              <h3>{editingUser ? 'Редактирование пользователя' : 'Создание пользователя'}</h3>
            </div>
            <form onSubmit={handleSubmit} className={styles['users__modal-body']}>
              {modalError && <div className={styles['users__form-error']}>{modalError}</div>}
              <label className={styles['users__label']}>
                <span>Имя</span>
                <input className={styles['users__input']} value={formName} onChange={(e) => setFormName(e.target.value)} />
              </label>
              <label className={styles['users__label']}>
                <span>URL аватара</span>
                <input className={styles['users__input']} value={formAvatar} onChange={(e) => setFormAvatar(e.target.value)} />
              </label>
              <div className={styles['users__modal-actions']}>
                <button type="button" onClick={closeModal} className={styles['users__btn--ghost']} disabled={saving}>Отмена</button>
                <button type="submit" className={styles['users__btn']} disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

