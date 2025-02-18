# Pokédex React Application

A modern, responsive Pokédex web application built with React, TypeScript, and Vite. This application demonstrates integration with the PokéAPI (v2) to showcase Pokémon data with various viewing and filtering options.

## Features

- **Multiple View Options**: Toggle between grid and list views (persisted across sessions)
- **Generation Filtering**: Filter Pokémon by their generation with paginated results
- **Detailed Pokémon Information**:
  - National Pokédex number
  - Official artwork
  - Type information
  - Generation information
  - Base stats with visual representation
  - Physical characteristics (height, weight)
  - Special categories (Legendary, Mythical, Baby)
  - Capture rate percentage

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Routing**: React Router
- **HTTP Client**: Axios
- **API**: PokéAPI v2

## API Integration Details

This application utilizes several PokéAPI endpoints with specific implementation details:

### Core Endpoints and Implementation

1. **Pokémon List** (`/pokemon`)
   - Used for paginated main listing view
   - Implementation: 
     - Fetches 20 Pokémon per page with offset-based pagination
     - Enhanced with species data for complete information
     - Caching via React Query with invalidation on filter changes

2. **Pokémon Details** (`/pokemon/{id or name}`)
   - Used for individual Pokémon data
   - Implementation:
     - Parallel fetching of Pokémon and species data
     - Smart error handling with fallback to species endpoint
     - Automatic resolution of default forms for variant Pokémon

3. **Pokémon Species** (`/pokemon-species/{id or name}`)
   - Used for enhanced Pokémon information
   - Implementation:
     - Always fetched alongside Pokémon data for complete information
     - Handles form variants through varieties field
     - Used to determine legendary/mythical status

4. **Generations** (`/generation`)
   - Used for generation-based filtering
   - Implementation:
     - Fetches complete generation data including all Pokémon
     - Maintains relationship between Pokémon and their generations
     - Optimized with client-side filtering when combined with search

### Species Complexities and Edge Cases

The PokéAPI presents several complexities around Pokémon species and variants that this implementation handles:

1. **Nidoran Gender Forms**
   - Special case: Two separate species entries (`nidoran-m` and `nidoran-f`)
   - API quirk: Uses `-m/-f` suffix but displays as ♂/♀ symbols
   - Solution: Custom name formatting with symbol conversion
   ```typescript
   // Handle Nidoran special cases
   if (variantName === 'nidoran-m') return 'Nidoran ♂';
   if (variantName === 'nidoran-f') return 'Nidoran ♀';
   ```

2. **Non-Default Forms**
   - Challenge: Species can have multiple forms but only one "default"
   - Examples: Giratina (Origin/Altered), Deoxys (Normal/Attack/Defense/Speed)
   - Implementation: 
     - Fetch all variants through species.varieties
     - Filter non-default forms for variant display
     - Maintain relationship between base form and variants

3. **Form Naming Conventions**
   - Issue: Inconsistent form name formats in API
   - Solution: Smart name formatting
   ```typescript
   // Remove species name prefix and format remaining parts
   variantName.replace(speciesName + '-', '')
     .split('-')
     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
     .join(' ')
   ```

4. **Species-Pokemon Relationships**
   - Challenge: Need to fetch both species and pokemon data
   - Solution: Parallel fetching with relationship maintenance
   ```typescript
   const [pokemon, species] = await Promise.all([
     api.getPokemon(id),
     api.getSpecies(id)
   ]);
   ```

### Data Flow and Optimization

1. **Search Implementation**
   - Two-stage search process:
     1. Exact match attempt against ID/name
     2. Fuzzy search against first 1000 Pokémon
   - Limited to 5 results for performance
   - Includes both name and ID-based searching

2. **Generation Filtering**
   - Pre-fetches all Pokémon for selected generation
   - Client-side pagination for filtered results
   - Maintains search compatibility within generation context

3. **Caching Strategy**
   - React Query caching with the following keys:
     - ['pokemon-list', page]
     - ['pokemon-details', pokemonList?.results]
     - ['generation', selectedGeneration]
     - ['pokemon-by-generation', selectedGeneration]
     - ['pokemon-search', searchTerm, selectedGeneration]

## Suggested SDK Improvements

Current implementation could be enhanced with:

1. **Smart Request Batching**
   ```typescript
   // Current implementation:
   const pokemon = await api.getPokemon(id);
   const species = await api.getSpecies(id);

   // Proposed batching:
   const sdk = new PokeAPI();
   const pokemon = await sdk.pokemon(id)
     .include(['species', 'evolution_chain'])
     .fetch();
   ```

2. **Relationship Resolution**
   ```typescript
   // Enhanced relationship handling:
   const generation = await sdk.generation(1)
     .includePokemon()
     .withSpecies()
     .paginate({ limit: 20 })
     .fetch();
   ```

3. **Type-Safe Filters**
   ```typescript
   const results = await sdk.pokemon
     .filter(p => p.type.equals('fire'))
     .where({ generation: 1 })
     .orderBy('id')
     .fetch();
   ```

4. **Resource-Specific Methods**
   ```typescript
   // Type and generation-aware filtering
   const fireStarters = await sdk.pokemon
     .starters()
     .ofType('fire')
     .fetch();
   ```

5. **Reactive Data Updates**
   ```typescript
   const subscription = sdk.pokemon(id)
     .subscribe(pokemon => {
       // Handle real-time updates
     });
   ```

A dedicated SDK could significantly improve handling of these complexities:

1. **Form-Aware Species Handling**
   ```typescript
   // Simplified form handling
   const sdk = new PokemonSDK();
   
   // Get all forms of a species
   const allForms = await sdk.species('giratina').getAllForms();
   
   // Get specific form
   const originForm = await sdk.species('giratina').getForm('origin');
   
   // Smart gender handling
   const maleNidoran = await sdk.species('nidoran').male();
   const femaleNidoran = await sdk.species('nidoran').female();
   ```

2. **Relationship-Aware Queries**
   ```typescript
   // Get a Pokemon with all its related data
   const pokemon = await sdk.pokemon('giratina')
     .include(['forms', 'species', 'evolution_chain'])
     .loadSprites(['official-artwork', 'default'])
     .fetch();

   // Type-safe form access
   const forms = pokemon.forms;  // TypeScript knows these are PokemonForm[]
   const sprites = pokemon.sprites.officialArtwork;  // Type-safe sprite access
   ```

3. **Smart Caching and Batching**
   ```typescript
   // Batch multiple related requests
   const sdk = new PokemonSDK({
     caching: {
       strategy: 'memory',
       ttl: '1h',
       invalidation: 'smart'
     }
   });

   // These will be batched and cached efficiently
   const [pokemon, relatedForms, evolutionChain] = await sdk.batch([
     sdk.pokemon('giratina'),
     sdk.species('giratina').forms(),
     sdk.species('giratina').evolution()
   ]);
   ```

4. **Form Transformation Pipeline**
   ```typescript
   const sdk = new PokemonSDK();
   
   // Define custom form display rules
   sdk.forms.addDisplayRule('nidoran', {
     'm': '♂',
     'f': '♀'
   });

   // Or use the built-in formatter
   const formName = sdk.forms.format('giratina-origin');  // Returns "Giratina Origin"
   ```

5. **Type-Safe Form Management**
   ```typescript
   interface PokemonForm {
     name: string;
     isDefault: boolean;
     sprites: FormSprites;
     // ... other form-specific properties
   }

   // Type-safe form operations
   const forms = await sdk.pokemon('giratina').getForms<PokemonForm>();
   const defaultForm = forms.getDefault();
   const alternativeForms = forms.getNonDefault();
   ```

These SDK improvements would make handling complex species relationships and forms much more intuitive while maintaining type safety and performance.

## Setup & Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
