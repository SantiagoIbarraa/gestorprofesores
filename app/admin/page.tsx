"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { HeaderUser } from "@/components/header-user"
import { ProfesorList } from "@/components/admin/profesor-list"
import { SchedulesManager } from "@/components/schedules-manager"
import { ProfessorAttendanceManager } from "@/components/professor-attendance-manager"
import { UsersManager } from "@/components/users-manager"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("teachers")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState<{ denied: boolean; role?: string; error?: string }>({ denied: false })

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        const response = await fetch("/api/auth/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
          cache: "no-store", // Disable caching
        })

        const { role } = await response.json()
        console.log("[Admin Page] Role checked:", role)

        if (role !== "admin" && role !== "profesor") {
          console.log("[Admin Page] Access denied for role:", role)
          setAccessDenied({ denied: true, role })
          return
        }

        setIsAdmin(true)
        setLoading(false)
      } catch (error) {
        console.error("[Admin Page] Error checking admin:", error)
        setAccessDenied({ denied: true, error: String(error) })
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    if (accessDenied.denied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">Tu rol actual es: <span className="font-mono font-bold">{accessDenied.role || "Desconocido"}</span></p>
          {accessDenied.error && <p className="text-red-500 text-sm">Error: {accessDenied.error}</p>}
          <p className="text-gray-500">No tienes permisos para ver esta página.</p>
          <button
            onClick={() => router.push("/attendance")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      )
    }
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderUser />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>

        </div>

        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-4 py-2 font-medium ${activeTab === "teachers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Profesores
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`px-4 py-2 font-medium ${activeTab === "schedules" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Horarios
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium ${activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 font-medium ${activeTab === "attendance" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Asistencias
          </button>
        </div>

        {activeTab === "teachers" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <ProfesorList />
          </div>
        )}

        {activeTab === "schedules" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <SchedulesManager />
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <UsersManager />
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <ProfessorAttendanceManager />
          </div>
        )}
      </div>
    </div>
  )
}
