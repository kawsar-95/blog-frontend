// components/Table.jsx — shared table-cell components, replacing the Th/Td definitions that
// used to be duplicated verbatim at the bottom of app/dashboard/blogs/page.jsx and
// app/admin/users/page.jsx.
export function Th({ children, className = "" }) {
  return (
    <th
      className={
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 " +
        className
      }
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={"px-4 py-3 align-middle " + className}>{children}</td>;
}
