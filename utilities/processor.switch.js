/**
 * switch function for generating trade discount fee
 * as of 1/1/2020
 */
// exports.tradefees = (doc) => {
// 	return new Promise((resolve, reject) => {
// 		if (doc.CNAME.match(/IMCO/g)) {
// 			resolve(0.01);
// 		}

// 		const tf_obj = {
// 			'1300': 0.075,
// 			'1200': 0.02,
// 			'2250': 0.02,
// 			'2772': 0.02,
// 			'8497': 0.02,
// 			'2091': 0.03,
// 			'1716': 0.05,
// 			'1719': 0.02,
// 			'9988': 0.1,
// 			'1402': 0.07,
// 			'1404': 0.07,
// 			'2084': 0.04308,
// 			'2614': 0.01,
// 			'5214': 0.02,
// 			'1070': 0.01
// 		};

// 		if (tf_obj[doc.CUST] > 0) {
// 			resolve(tf_obj[doc.CUST]);
// 		} else {
//             resolve(0)
//         }

// 		reject('err');
// 	});
// };

exports.tradefees = (doc) => {

	if (doc.CNAME.match(/IMCO/g)) {
		return 0.01;
	}

	const tf_obj = {
		'1300': 0.075,
		'1200': 0.02,
		'2250': 0.02,
		'2772': 0.02,
		'8497': 0.02,
		'2091': 0.03,
		'1716': 0.05,
		'1719': 0.02,
		'9988': 0.1,
		'1402': 0.07,
		'1404': 0.07,
		'2084': 0.04308,
		'2614': 0.01,
		'5214': 0.02,
		'1070': 0.01
	};

	if (tf_obj[doc.CUST] > 0) {
		return tf_obj[doc.CUST];
	} else {
		return 0
	}
};