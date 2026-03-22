import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLOMBO_CENTER = [6.9271, 79.8612];
const SRI_LANKA_BOUNDS = [
  [5.8, 79.4],
  [10.05, 82],
];

const MAP_MARKER_ICON = new L.Icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickCapture({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });

  return null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(position, 15, { duration: 0.8 });
  }, [map, position]);

  return null;
}

ClickCapture.propTypes = {
  onPick: PropTypes.func.isRequired,
};

RecenterMap.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
};

RecenterMap.defaultProps = {
  position: null,
};

function clampToSriLanka(lat, lng) {
  const minLat = SRI_LANKA_BOUNDS[0][0];
  const minLng = SRI_LANKA_BOUNDS[0][1];
  const maxLat = SRI_LANKA_BOUNDS[1][0];
  const maxLng = SRI_LANKA_BOUNDS[1][1];

  return {
    lat: Math.min(maxLat, Math.max(minLat, Number(lat))),
    lng: Math.min(maxLng, Math.max(minLng, Number(lng))),
  };
}

async function reverseGeocodeSriLanka(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      return "";
    }

    const payload = await response.json();
    const countryCode = String(
      payload?.address?.country_code || "",
    ).toLowerCase();

    if (countryCode !== "lk") {
      return "";
    }

    return payload?.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding failed", error);
    return "";
  }
}

export default function LocationPickerMap({ latitude, longitude, onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const markerPosition = useMemo(() => {
    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return null;
    }

    const clamped = clampToSriLanka(Number(latitude), Number(longitude));
    return [clamped.lat, clamped.lng];
  }, [latitude, longitude]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);

        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "6");
        url.searchParams.set("countrycodes", "lk");
        url.searchParams.set("bounded", "1");
        url.searchParams.set("viewbox", "79.4,10.05,82.0,5.8");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            "Accept-Language": "en",
          },
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const handlePick = async ({ lat, lng }) => {
    const clamped = clampToSriLanka(lat, lng);
    const locationName = await reverseGeocodeSriLanka(clamped.lat, clamped.lng);

    onChange({
      latitude: Number(clamped.lat.toFixed(6)),
      longitude: Number(clamped.lng.toFixed(6)),
      locationName,
    });
  };

  const handleSearchSelect = (result) => {
    const lat = Number(result?.lat);
    const lng = Number(result?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    setSearchQuery(result.display_name || "");
    setSearchResults([]);

    const clamped = clampToSriLanka(lat, lng);
    onChange({
      latitude: Number(clamped.lat.toFixed(6)),
      longitude: Number(clamped.lng.toFixed(6)),
      locationName: result.display_name || "",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe4f3]">
      <div className="border-b border-[#dbe4f3] bg-white p-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search places in Sri Lanka"
          className="w-full rounded-xl border border-[#dbe4f3] px-3 py-2 text-sm outline-none focus:border-[#a5b9db]"
        />
        {isSearching ? (
          <p className="mt-2 text-xs text-[#6b7280]">Searching locations...</p>
        ) : null}
        {searchResults.length ? (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white">
            {searchResults.map((result) => (
              <button
                key={`${result.place_id}-${result.lat}-${result.lon}`}
                type="button"
                onClick={() => handleSearchSelect(result)}
                className="block w-full border-b border-[#f1f5f9] px-3 py-2 text-left text-sm text-[#1f2937] last:border-b-0 hover:bg-[#f8fafc]"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <MapContainer
        center={markerPosition || COLOMBO_CENTER}
        zoom={13}
        scrollWheelZoom
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={7}
        className="h-[280px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickCapture onPick={handlePick} />

        <RecenterMap position={markerPosition} />

        {markerPosition ? (
          <Marker position={markerPosition} icon={MAP_MARKER_ICON} />
        ) : null}
      </MapContainer>
    </div>
  );
}

LocationPickerMap.propTypes = {
  latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
};

LocationPickerMap.defaultProps = {
  latitude: null,
  longitude: null,
};
