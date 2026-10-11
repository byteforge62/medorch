CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Schedule"
ADD CONSTRAINT "Schedule_no_room_overlap"
EXCLUDE USING gist (
  "otRoomId" WITH =,
  (tsrange("startTime", "endTime", '[)')) WITH &&
)
WHERE ("status" NOT IN ('CANCELLED', 'COMPLETED'));

ALTER TABLE "Schedule"
ADD CONSTRAINT "Schedule_no_surgeon_overlap"
EXCLUDE USING gist (
  "surgeonId" WITH =,
  (tsrange("startTime", "endTime", '[)')) WITH &&
)
WHERE ("status" NOT IN ('CANCELLED', 'COMPLETED'));

ALTER TABLE "Schedule"
ADD CONSTRAINT "Schedule_no_patient_overlap"
EXCLUDE USING gist (
  "patientId" WITH =,
  (tsrange("startTime", "endTime", '[)')) WITH &&
)
WHERE ("status" NOT IN ('CANCELLED', 'COMPLETED'));