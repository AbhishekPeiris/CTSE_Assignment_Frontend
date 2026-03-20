import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLOMBO_CENTER = [6.9271, 79.8612];

const MAP_MARKER_ICON = new L.Icon({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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

export default function LocationPickerMap({ latitude, longitude, onChange }) {
    const markerPosition = useMemo(() => {
        if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
            return null;
        }

        return [Number(latitude), Number(longitude)];
    }, [latitude, longitude]);

    return (
        <div className="overflow-hidden rounded-2xl border border-[#dbe4f3]">
            <MapContainer
                center={markerPosition || COLOMBO_CENTER}
                zoom={13}
                scrollWheelZoom
                className="h-[280px] w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ClickCapture
                    onPick={(latlng) =>
                        onChange({
                            latitude: Number(latlng.lat.toFixed(6)),
                            longitude: Number(latlng.lng.toFixed(6)),
                        })
                    }
                />

                <RecenterMap position={markerPosition} />

                {markerPosition ? <Marker position={markerPosition} icon={MAP_MARKER_ICON} /> : null}
            </MapContainer>
        </div>
    );
}
