// src/app/components/DashboardLayout.js
import Link from 'next/link';
import styles from './DashboardLayout.module.css'; // Importa los estilos CSS

const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      {/* Menú lateral */}
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/dashboard/decanos">Lista de Decanos</Link></li>
          <li><Link href="/dashboard/ocde">Lista de OCDE</Link></li>
          <li><Link href="/dashboard/orcid">Lista de ORCID</Link></li>
          <li><Link href="/dashboard/investigaciones">Relación de Investigaciones</Link></li>
          <li><Link href="/dashboard/cargarexcel">Cargar Excel</Link></li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;