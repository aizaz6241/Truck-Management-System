"use client";

import { useRouter } from "next/navigation";
import { deleteStatement } from "@/actions/statement";

interface Statement {
  id: number;
  name: string;
  type: string;
  date: Date;
  createdAt: Date;
}

export default function StatementList({
  statements,
}: {
  statements: Statement[];
}) {
  const router = useRouter();

  if (!statements || statements.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
        No statements generated yet. Click "Generate Statement" to create one.
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this statement? This action cannot be undone.",
      )
    ) {
      const res = await deleteStatement(id);
      if (!res || !res.success) {
        alert("Failed to delete statement");
      }
    }
  };

  return (
    <div
      className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 mt-6"
      style={{
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        background: "white",
        marginTop: "1.5rem",
      }}
    >
      <table
        className="w-full text-left border-collapse min-w-[600px]"
        style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}
      >
        <thead
          className="bg-gray-100 text-gray-600 border-b border-gray-200"
          style={{
            backgroundColor: "#f3f4f6",
            color: "#4b5563",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <tr>
            <th
              className="p-4 font-semibold text-sm"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              ID
            </th>
            <th
              className="p-4 font-semibold text-sm"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              Name
            </th>
            <th
              className="p-4 font-semibold text-sm"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              Type
            </th>
            <th
              className="p-4 font-semibold text-sm"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              Date
            </th>
            <th
              className="p-4 font-semibold text-sm"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              Created At
            </th>
            <th
              className="p-4 font-semibold text-sm text-right"
              style={{
                padding: "16px",
                fontWeight: "600",
                fontSize: "0.875rem",
                textAlign: "right",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {statements.map((stmt) => (
            <tr
              key={stmt.id}
              className="hover:bg-gray-50 transition-colors"
              style={{ borderBottom: "1px solid #e5e7eb" }}
            >
              <td
                className="p-4 text-gray-600 text-sm"
                style={{
                  padding: "16px",
                  color: "#4b5563",
                  fontSize: "0.875rem",
                }}
              >
                #{stmt.id}
              </td>
              <td
                className="p-4 font-medium text-gray-900 text-sm"
                style={{
                  padding: "16px",
                  fontWeight: "500",
                  color: "#111827",
                  fontSize: "0.875rem",
                }}
              >
                {stmt.name}
              </td>
              <td
                className="p-4 text-sm"
                style={{ padding: "16px", fontSize: "0.875rem" }}
              >
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                  style={{
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {stmt.type}
                </span>
              </td>
              <td
                className="p-4 text-gray-600 text-sm"
                style={{
                  padding: "16px",
                  color: "#4b5563",
                  fontSize: "0.875rem",
                }}
              >
                {new Date(stmt.date).toLocaleDateString("en-GB")}
              </td>
              <td
                className="p-4 text-gray-600 text-sm"
                style={{
                  padding: "16px",
                  color: "#4b5563",
                  fontSize: "0.875rem",
                }}
              >
                {new Date(stmt.createdAt).toLocaleString("en-GB")}
              </td>
              <td
                className="p-4 text-right"
                style={{
                  padding: "16px",
                  textAlign: "right",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "white",
                    backgroundColor: "#2563eb",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/admin/statements/${stmt.id}`)}
                >
                  View / Download
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "white",
                    backgroundColor: "#dc2626",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(stmt.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
