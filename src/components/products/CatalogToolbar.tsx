import { Search } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { catalogUrl, sortOptions, type CatalogParams } from '@/lib/catalogUrl'
import type { CatalogSort } from '@/types/product'

interface Props {
  params: CatalogParams
}

/**
 * Búsqueda y orden del catálogo. Los filtros viven en la URL: al cambiar algo se
 * navega a la nueva dirección y el servidor devuelve la página ya filtrada.
 * Sin JavaScript, la búsqueda sigue funcionando como un formulario GET normal.
 */
export function CatalogToolbar({ params }: Props) {
  // Campo no controlado: lo que el cliente escriba antes de que la página se active no se pierde.
  const searchRef = useRef<HTMLInputElement>(null)
  const sortLabel = sortOptions.find((option) => option.value === params.orden)?.label

  // Buscar u ordenar conserva la categoría y vuelve a la primera página.
  const go = (changes: Partial<CatalogParams>) => {
    const q = (searchRef.current?.value ?? params.q).trim()
    window.location.assign(catalogUrl({ q, categoria: params.categoria, orden: params.orden, ...changes }))
  }

  return (
    <form
      action="/catalogo"
      method="get"
      role="search"
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        go({})
      }}
    >
      {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
      {params.orden !== 'recientes' && <input type="hidden" name="orden" value={params.orden} />}

      <div className="relative flex-1 md:max-w-md">
        <Label htmlFor="catalog-search" className="sr-only">
          Buscar productos
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-stone" />
        <Input
          id="catalog-search"
          type="search"
          name="q"
          ref={searchRef}
          defaultValue={params.q}
          maxLength={80}
          placeholder="Buscar productos…"
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 pr-24 pl-11"
        />
        <Button type="submit" size="sm" className="absolute top-1/2 right-1.5 h-9 -translate-y-1/2 px-4">
          Buscar
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="catalog-sort" className="shrink-0 font-normal text-stone">
          Ordenar por
        </Label>
        <Select value={params.orden} onValueChange={(value) => go({ orden: value as CatalogSort })}>
          <SelectTrigger id="catalog-sort" className="w-full flex-1 data-[size=default]:h-12 md:w-56 md:flex-none">
            <SelectValue>{sortLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  )
}
