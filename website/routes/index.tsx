import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <div class="container mx-auto">
      <div class="max-w-screen-md mx-auto p-4 flex flex-col items-center justify-center">
        <img
          class="w-full"
          src="/logo.svg"
          alt="Logo Assnatouverte"
        />
        <p class="text-2xl lg:text-4xl text-center p-8">
          Le site est en construction, aidez-nous rendre notre démocratie plus
          {" "}
          <em>ouverte</em>&nbsp;!
        </p>
        <a href="https://github.com/assnatouverte/assnatouverte">
          <img
            class="w-1/2 mx-auto"
            src="/github.png"
            alt="Logo GitHub"
          />
        </a>
      </div>
    </div>
  );
});
