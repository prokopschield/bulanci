#!/usr/bin/env node

import bulanci from '.';

if (bulanci.exists) {
	bulanci.run().then((child) => {
		child.stdout?.pipe(process.stdout);
		child.stderr?.pipe(process.stdout);
	});
} else {
	bulanci
		.put()
		.then(() => bulanci.run())
		.then((child) => {
			child.stdout?.pipe(process.stdout);
			child.stderr?.pipe(process.stdout);
		});
}
