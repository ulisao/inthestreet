import { ABMProductos } from "@/components/panel/ABMProductos";
import { ABMOpciones } from "@/components/panel/ABMOpciones";

export default function PaginaMenu() {
  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-3 sm:p-4">
      <ABMProductos />
      <hr className="border-t-2 border-tinta" />
      <ABMOpciones />
    </div>
  );
}
