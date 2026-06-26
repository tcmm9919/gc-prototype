import "react";

// styled-jsx (встроен в Next.js) использует атрибуты `jsx`/`global` на <style>.
// Объявляем их для TS, чтобы `<style jsx global>` не падал в typecheck.
declare module "react" {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
