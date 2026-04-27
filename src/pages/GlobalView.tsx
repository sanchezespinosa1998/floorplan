import { useState } from "react";
import { Building2, CalendarDays, History, Network, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListFilters } from "@/components/shared/ListFilters";
import { useProfile } from "@/context/ProfileContext";
import { fairs, fairVersionStatusLabels, getFairVersions, venues, type FairVersionStatus } from "@/data/mockData";
import { motion } from "framer-motion";

export default function GlobalView() {
  const { can } = useProfile();
  const [search, setSearch] = useState('');
  const [versionStatusFilter, setVersionStatusFilter] = useState<FairVersionStatus | 'all'>('all');
  const canViewVersions = can("view_fair_versions");
  const normalizedSearch = search.trim().toLowerCase();

  const hierarchy = venues
    .map(venue => {
      const venueFairs = fairs
        .filter(fair => fair.venueId === venue.id)
        .sort((first, second) => first.name.localeCompare(second.name, "es"))
        .map(fair => {
          const versions = getFairVersions(fair.id)
            .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
            .filter(version => versionStatusFilter === 'all' || version.status === versionStatusFilter);

          const fairMatches =
            !normalizedSearch ||
            fair.name.toLowerCase().includes(normalizedSearch) ||
            fair.edition.toLowerCase().includes(normalizedSearch) ||
            versions.some(version => {
              const haystack = `${version.label} ${version.summary} ${version.createdBy}`.toLowerCase();
              return haystack.includes(normalizedSearch);
            });

          return fairMatches
            ? {
                ...fair,
                versions,
              }
            : null;
        })
        .filter((fair): fair is NonNullable<typeof fair> => Boolean(fair));

      const venueMatches =
        !normalizedSearch ||
        venue.name.toLowerCase().includes(normalizedSearch) ||
        venue.location.toLowerCase().includes(normalizedSearch);

      const includeVenue = venueMatches || venueFairs.length > 0;
      const fairsForVenue = venueMatches ? venueFairs : venueFairs;

      return includeVenue
        ? {
            ...venue,
            fairs: fairsForVenue,
          }
        : null;
    })
    .filter((venue): venue is NonNullable<typeof venue> => Boolean(venue))
    .filter(venue => venue.fairs.length > 0);

  const venueCount = hierarchy.length;
  const fairCount = hierarchy.reduce((acc, venue) => acc + venue.fairs.length, 0);
  const versionCount = hierarchy.reduce(
    (acc, venue) =>
      acc +
      venue.fairs.reduce(
        (fairAcc, fair) => fairAcc + fair.versions.length,
        0
      ),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Global View" }]} />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Global View</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Nested structure of venues, fairs, and versions in a single view.
            </p>
          </div>
        </div>
      </motion.div>

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search venue, fair or version"
        searchAriaLabel="Search in global view"
        selects={[
          {
            label: 'Version status',
            value: versionStatusFilter,
            onChange: (value) => setVersionStatusFilter(value as FairVersionStatus | 'all'),
            options: [
              { value: 'all', label: 'All statuses' },
              ...Object.entries(fairVersionStatusLabels).map(([value, label]) => ({ value, label })),
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setVersionStatusFilter('all');
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-card  border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Venues</p>
          <p className="text-2xl font-bold text-foreground mt-1">{venueCount}</p>
        </div>
        <div className="bg-card  border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Fairs</p>
          <p className="text-2xl font-bold text-foreground mt-1">{fairCount}</p>
        </div>
        <div className="bg-card  border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Versions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{versionCount}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-4"
      >
        {hierarchy.map(venue => (
          <section key={venue.id} className=" border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-border bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">{venue.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{venue.location} · {venue.fairs.length} fairs</p>
              </div>
              <Link
                to={`/venues/${venue.id}`}
                className="inline-flex items-center gap-2 px-3 py-2  text-xs font-medium border border-border hover:bg-muted transition-colors"
              >
                View venue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 space-y-4">
              {venue.fairs.map((fair, fairIndex) => (
                <motion.article
                  key={fair.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + fairIndex * 0.05 }}
                  className=" border border-border bg-background/70 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4 p-4 border-b border-border/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{fair.name} {fair.edition}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{fair.versions.length} versions</p>
                    </div>
                    <Link
                      to={`/fairs/${fair.id}`}
                      className="inline-flex items-center gap-2 px-3 py-2  text-xs font-medium border border-border hover:bg-muted transition-colors"
                    >
                      View fair
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {canViewVersions && fair.versions.length > 0 && (
                    <div className="p-4 space-y-2">
                      {fair.versions.map((version, versionIndex) => (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + fairIndex * 0.05 + versionIndex * 0.03 }}
                        >
                          <Link
                            to={`/fairs/${fair.id}/versions`}
                            className="flex items-center justify-between gap-3  border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{version.label}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{version.summary}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </section>
        ))}
      </motion.div>

      {hierarchy.length === 0 && (
        <div className="bg-card  border border-border p-8 text-center">
          <Network className="h-8 w-8 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground mt-3">No structure available</h2>
          <p className="text-sm text-muted-foreground mt-1">
            There is no linked data between venues and fairs to show the global view.
          </p>
        </div>
      )}
    </div>
  );
}
