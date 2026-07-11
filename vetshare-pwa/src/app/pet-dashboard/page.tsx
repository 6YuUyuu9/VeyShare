'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

type ProfileRecord = {
  id?: string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar_url?: string | null;
};

type PetRecord = {
  id?: string;
  name?: string | null;
  species?: string | null;
  breed?: string | null;
  age?: number | string | null;
  owner_id?: string | null;
  user_id?: string | null;
  created_at?: string | null;
};

async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const tables = ['profiles', 'users'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id, full_name, name, email, role, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return data as ProfileRecord;
    }
  }

  return null;
}

async function fetchPets(userId: string): Promise<PetRecord[]> {
  const tables = ['pets', 'pet_profiles'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id, name, species, breed, age, owner_id, user_id, created_at')
      .or(`owner_id.eq.${userId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as PetRecord[];
    }
  }

  return [];
}

export default function PetDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [displayName, setDisplayName] = useState('ผู้ใช้งาน');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        setMessage('');

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const authUser = session?.user;
        if (!authUser) {
          if (isMounted) {
            setMessage('กรุณาเข้าสู่ระบบก่อนเพื่อดูข้อมูล');
          }
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const activeUser = user ?? authUser;
        const profileData = await fetchProfile(activeUser.id);
        const petData = await fetchPets(activeUser.id);

        if (!isMounted) {
          return;
        }

        setEmail(activeUser.email ?? '');
        setProfile(profileData);
        setPets(petData);
        setDisplayName(
          profileData?.full_name ||
            profileData?.name ||
            activeUser.user_metadata?.full_name ||
            activeUser.email?.split('@')[0] ||
            'ผู้ใช้งาน'
        );

        if (!profileData && petData.length === 0) {
          setMessage('ยังไม่มีข้อมูลโปรไฟล์หรือสัตว์เลี้ยงที่พร้อมแสดงในระบบ');
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้ในขณะนี้');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const accessHistory = [
    { name: 'คลินิกสัตว์รักสัตว์', pet: 'ถ้วยฟู', time: '10 นาทีที่แล้ว' },
    { name: 'โรงพยาบาลสัตว์ A', pet: 'กล้วยเชื่อม', time: 'เมื่อวานนี้' },
  ];

  const quickActions = [
    { title: 'สร้าง QR Code', subtitle: 'แชร์สิทธิ์ข้อมูลเวชระเบียนด่วน', icon: '🕒' },
    { title: 'ดูประวัติ', subtitle: 'ตรวจเช็กการเข้าถึงก่อนหน้า', icon: '📜' },
  ];

  return (
    <main className="vet-shell min-h-screen px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="vet-card flex items-center justify-between rounded-[24px] px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="vet-ring flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vet-primary-soft)] text-lg">🌿</div>
            <div>
              <p className="text-sm font-semibold text-[var(--vet-primary)]">โปรไฟล์</p>
              <p className="text-sm font-bold text-[var(--vet-text)]">VetShare</p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vet-primary-soft)] text-lg">
            🔔
          </button>
        </header>

        <section className="vet-card rounded-[28px] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--vet-primary)]">หน้าแรก</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--vet-text)]">สวัสดีคุณ {displayName} 🌿</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--vet-text-soft)]">
                วันนี้สัตว์เลี้ยงของคุณเป็นอย่างไรบ้าง?
              </p>
            </div>
            <div className="vet-card-soft rounded-2xl px-4 py-3 text-sm text-[var(--vet-text)]">
              <p className="font-semibold text-[var(--vet-primary-dark)]">บัญชีที่ล็อกอิน</p>
              <p className="mt-1 text-[var(--vet-text-soft)]">{email || 'กำลังรอข้อมูล'}</p>
            </div>
          </div>
        </section>

        {(errorMessage || message) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${errorMessage ? 'border-red-200 bg-red-50 text-red-700' : 'border-[var(--vet-border)] bg-[var(--vet-primary-soft)] text-[var(--vet-primary-dark)]'}`}>
            {errorMessage || message}
          </div>
        )}

        <section className="vet-card rounded-[28px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--vet-primary)]">สัตว์เลี้ยงของคุณ</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--vet-text)]">รายการที่พร้อมใช้งาน</h2>
            </div>
            <div className="vet-badge rounded-full px-3 py-1 text-sm font-semibold">
              {pets.length} ตัว
            </div>
          </div>

          {loading ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              กำลังโหลดข้อมูลจากฐานข้อมูล...
            </div>
          ) : pets.length > 0 ? (
            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {pets.map((pet, index) => {
                const accessLabel = index % 2 === 0 ? 'ส่วนตัว' : 'กำลังแชร์';
                const emoji = index % 2 === 0 ? '🐶' : '🐱';

                return (
                  <article
                    key={pet.id || pet.name}
                    className="vet-card-soft min-w-[220px] flex-1 rounded-[24px] p-4"
                  >
                    <div className="vet-ring flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      {emoji}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{pet.name || 'สัตว์เลี้ยง'}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {pet.species || 'ไม่ระบุประเภท'}
                      {pet.breed ? ` • ${pet.breed}` : ''}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="vet-badge rounded-full px-3 py-1 font-semibold shadow-sm">
                        {accessLabel}
                      </span>
                      <span className="font-semibold text-[var(--vet-primary)]">
                        {pet.age ? `${pet.age} ปี` : 'ไม่ระบุอายุ'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--vet-border)] bg-[var(--vet-surface-muted)] p-6 text-center text-sm text-[var(--vet-text-soft)]">
              ยังไม่มีข้อมูลสัตว์เลี้ยงสำหรับบัญชีนี้
            </div>
          )}
        </section>

        <section className="vet-card rounded-[28px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--vet-primary)]">ทางลัดด่วน</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--vet-text)]">Quick Actions</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.title}
                className="flex items-center gap-3 rounded-[20px] border border-[var(--vet-border)] bg-[var(--vet-surface-muted)] px-4 py-4 text-left transition hover:border-[var(--vet-primary)] hover:bg-[var(--vet-primary-soft)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-[var(--vet-text)]">{action.title}</p>
                  <p className="text-sm text-[var(--vet-text-soft)]">{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="vet-card rounded-[28px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--vet-primary)]">ประวัติการเข้าถึงข้อมูลล่าสุด</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--vet-text)]">บันทึกล่าสุด</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {accessHistory.map((item) => (
              <div key={`${item.name}-${item.pet}`} className="rounded-2xl border border-[var(--vet-border)] bg-[var(--vet-surface-muted)] px-4 py-3">
                <p className="font-semibold text-[var(--vet-text)]">{item.name}</p>
                <p className="mt-1 text-sm text-[var(--vet-text-soft)]">
                  เข้าดูข้อมูล “{item.pet}” • {item.time}
                </p>
              </div>
            ))}
          </div>
        </section>

        <nav className="vet-card flex items-center justify-between rounded-[24px] px-4 py-3">
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-[var(--vet-primary)]">
            <span>🏠</span>
            หน้าแรก
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500">
            <span>🐾</span>
            สัตว์เลี้ยง
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500">
            <span>📜</span>
            ประวัติ
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500">
            <span>⚙️</span>
            ตั้งค่า
          </button>
        </nav>
      </div>
    </main>
  );
}
