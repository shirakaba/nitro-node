import { buildAddon } from "nitro-node/build";

buildAddon(new URL("..", import.meta.url));
