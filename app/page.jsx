'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Page() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(''); // ใช้ในเฟส 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: false });
    if (error) setError(error.message);
    else setTodos(data || []);
  }

  useEffect(() => { fetchTodos(); }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    const payload = { title };
    // เฟส 2: ถ้ามี field assignee ใน DB แล้ว ค่อยส่งขึ้นไป
    if (assignee) payload.assignee = assignee;

    const { error } = await supabase.from('todos').insert(payload);
    setLoading(false);
    if (error) setError(error.message);
    else { setTitle(''); setAssignee(''); fetchTodos(); }
  }

  async function removeTodo(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchTodos();
  }

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 16 }}>
      <h1 className="bg-slate-500">Todo MVP</h1>

      <form onSubmit={addTodo} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        {/* เฟส 2 ค่อยเอาบรรทัดนี้ออกจากคอมเมนต์เมื่อมีคอลัมน์ assignee แล้ว */}
        {/* <input
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        /> */}
        <button type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {todos.map((t) => (
          <li key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee' }}>
            <span>
              {t.title}
              {t.assignee ? ` — ${t.assignee}` : ''}
            </span>
            <button onClick={() => removeTodo(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
