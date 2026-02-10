-- Remet toutes les candidatures sans "chasseur de tête" coché.
-- Tu pourras recocher la case pour les offres proposées par un chasseur.
UPDATE "Application" SET "publisherType" = NULL;
