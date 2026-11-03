import { redirect } from 'next/navigation';

/*======================================================================
  /admin — historical entry point
  ======================================================================
  This route previously rendered a parallel dashboard built from hardcoded
  figures: a fixed "78% average utilization", "47 surgical staff active",
  "94% equipment ready" and five gradient placeholders standing in for
  charts. None of it came from the database, so it misrepresented hospital
  performance on a real screen.

  The ADMIN control room lives at /dashboard, which is fed by the actual
  operational queries. This route now only forwards there so existing links
  and bookmarks keep working without a second, invented dashboard.
====================================================================== */

export default function AdminDashboard() {
  redirect('/dashboard');
}
