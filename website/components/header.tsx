export default function Footer() {
  return (
    <header class="bg-blue-200 mb-5">
      <div class="container mx-auto py-2 flex flex-wrap items-center justify-between">
        <a href="/">
          <image src="/logo.svg" alt="Logo Assnat Ouverte" class="h-24" />
        </a>
        <nav class="">
          <ul class="font-lg flex flex-row space-x-8 p-4 text-lg">
            <li class="block hover:underline">
              <a href="/legislatures">Législatures</a>
            </li>
            <li class="block hover:underline">
              <a href="/recherche">Recherche</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
