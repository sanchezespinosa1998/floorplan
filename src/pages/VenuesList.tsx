import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListFilters } from "@/components/shared/ListFilters";
import { venues, type Venue } from "@/data/mockData";
import { VenueFormDialog } from "@/components/layout/VenueFormDialog";
import { motion } from "framer-motion";
import { usePagination } from "@/hooks/usePagination";

export default function VenuesList() {
  const [search, setSearch] = useState('');
  const [minArea, setMinArea] = useState('all');
  const [minPavilions, setMinPavilions] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const filtered = venues.filter(v => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      v.name.toLowerCase().includes(normalizedSearch) ||
      v.location.toLowerCase().includes(normalizedSearch);

    const matchesArea = minArea === 'all' || v.area >= Number(minArea);
    const matchesPavilions = minPavilions === 'all' || v.pavilions >= Number(minPavilions);

    return matchesSearch && matchesArea && matchesPavilions;
  });

  const { paginatedItems, PaginationComponent } = usePagination({ items: filtered, itemsPerPage: 12 });

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Venues" }]} />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-start gap-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Venues</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} recintos registrados</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors" onClick={() => setIsDialogOpen(true)}>
          New venue
        </button>

        <VenueFormDialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingVenue(null);
          }}
          venue={editingVenue}
        />
      </motion.div>

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar recinto o ubicación"
        searchAriaLabel="Buscar recintos"
        selects={[
          {
            label: 'Area mínima',
            value: minArea,
            onChange: setMinArea,
            options: [
              { value: 'all', label: 'Cualquier tamaño' },
              { value: '10000', label: '>= 10.000 m2' },
              { value: '30000', label: '>= 30.000 m2' },
              { value: '60000', label: '>= 60.000 m2' },
            ],
          },
          {
            label: 'Pabellones',
            value: minPavilions,
            onChange: setMinPavilions,
            options: [
              { value: 'all', label: 'Cualquier número' },
              { value: '3', label: '>= 3 pabellones' },
              { value: '5', label: '>= 5 pabellones' },
              { value: '8', label: '>= 8 pabellones' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setMinArea('all');
          setMinPavilions('all');
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {paginatedItems.map(v => (
          <div key={v.id} className="relative group">
            <Link to={`/venues/${v.id}`} className="block bg-card rounded-lg border border-border p-5 hover:border-primary/40 transition-all">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{v.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{v.location}</p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{v.area.toLocaleString('es-ES')}</p>
                  <p className="text-xs text-muted-foreground">m²</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{v.pavilions}</p>
                  <p className="text-xs text-muted-foreground">Pabellones</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{v.fairCount}</p>
                  <p className="text-xs text-muted-foreground">Fairs</p>
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                setEditingVenue(v);
                setIsDialogOpen(true);
              }}
              className="absolute top-3 right-3 p-2 rounded-md bg-card border border-border hover:bg-muted transition-all"
              aria-label={`Edit ${v.name}`}
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay recintos que coincidan con los filtros seleccionados.
        </div>
      )}

      <PaginationComponent />
    </div>
  );
}
