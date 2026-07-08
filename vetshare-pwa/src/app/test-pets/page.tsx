// src/app/test-pets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

// กำหนด Type ของข้อมูลสัตว์เลี้ยงตามโครงสร้างตาราง
interface Pet {
  id: string;
  name: string;
  owner_id: string;
}

export default function TestPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);

        // ดึงข้อมูลจากตาราง 'pets'
        const { data, error: supabaseError } = await supabase
          .from("pets")
          .select("id, name, owner_id");

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          setPets(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  if (error)
    return (
      <div className="p-8 text-red-500 text-center">ข้อผิดพลาด: {error}</div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">
        🐾 รายชื่อสัตว์เลี้ยง (VetShare Test)
      </h1>

      {pets.length === 0 ? (
        <p className="text-gray-500 italic">
          ไม่พบข้อมูลสัตว์เลี้ยง (หากเปิด RLS ไว้ ต้องล็อกอินก่อน
          หรือไม่มีข้อมูลในระบบ)
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {pets.map((pet) => (
            <li key={pet.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-700">{pet.name}</span>
                <p className="text-xs text-gray-400">ID: {pet.id}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                เจ้าของ: {pet.owner_id.substring(0, 8)}...
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
