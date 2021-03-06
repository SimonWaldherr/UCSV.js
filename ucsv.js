/*!
 * UCSV v1.0.2
 * Provided under MIT License.
 *
 * Copyright 2010, Peter Johnson
 * http://www.uselesscode.org/javascript/csv/
 */

/* jsLint stuff */
/*global */
/*members apply, arrayToCsv, charAt, csvToArray, length, prototype, push, 
    replace, substring, test, toString, trim
*/

"use strict";
/**
 * Namespace for CSV functions
 * @namespace
 */
var CSV = (function () {

	var rxIsInt = /^\d+$/,
	rxIsFloat = /^\d*\.\d+$|^\d+\.\d*$/,
	rxNeedsQuoting = /^\s|\s$|,|"/,
	trim = (function () {
		// Fx 3.1 has a native trim function, it's about 10x faster, use it if it exists
		if (String.prototype.trim) {
			return function (s) {
				return s.trim();
			};
		} else {
			return function (s) {
				return s.replace(/^\s*/, '').replace(/\s*$/, '');
			};
		}
	}());
 
	function isNumber(o) {
		return Object.prototype.toString.apply(o) === '[object Number]';
	}

	function isString(o) {
		return Object.prototype.toString.apply(o) === '[object String]';
	}

	function chomp(s) {
		if (s.charAt(s.length - 1) !== "\n") {
			// Does not end with \n, just return string
			return s;
		} else {
			// Remove the \n
			return s.substring(0, s.length - 1);
		}
	}

 /**
	* Converts an array into a Comma Separated Values list.
	* Each item in the array should be an array that represents one line in the CSV.
	* Nulls are interpreted as empty fields.
	*
	* @param {String} a The array to convert
	*
	* @returns A CSV representation of the provided array.
	* @type string
	* @public
	* @static
	* @example
	* var csvArray = [
	* ['Leno, Jay', 10],
	* ['Conan "Conando" O\'Brien', '11:35' ],
	* ['Fallon, Jimmy', '12:35' ]
	* ];
	* CSV.arrayToCsv(csvArray);
	* // Outputs a string containing:
	* // "Leno, Jay",10
	* // "Conan ""Conando"" O'Brien",11:35
	* // "Fallon, Jimmy",12:35
	*/
	function arrayToCsv(a) {
		var cur,
		out = '',
		row,
		i,
		j;

		for (i = 0; i < a.length; i += 1) {
			row = a[i];
			for (j = 0; j < row.length; j += 1) {
				cur = row[j];

				if (isString(cur)) {
					// Escape any " with double " ("")
					cur = cur.replace(/"/g, '""');

					// If the field starts or ends with whitespace, contains " or , or is a string representing a number
					if (rxNeedsQuoting.test(cur) || rxIsInt.test(cur) || rxIsFloat.test(cur)) {
						cur = '"' + cur + '"';
					// quote empty strings
					} else if (cur === "") {
						cur = '""';
					}
				} else if (isNumber(cur)) {
					cur = cur.toString(10);
				} else if (cur === null) {
					cur = '';
				} else {
					cur = cur.toString();
				}

				out += j < row.length - 1 ? cur + ',' : cur;
			}
			// End record
			out += "\n";
		}

		return out;
	}

	/**
	 * Converts a Comma Separated Values string into an array of arrays.
	 * Each line in the CSV becomes an array.
	 * Empty fields are converted to nulls and non-quoted numbers are converted to integers or floats.
	 *
	 * @return The CSV parsed as an array
	 * @type Array
	 * 
	 * @param {String} s The string to convert
	 * @param {Boolean} [trm=false] If set to True leading and trailing whitespace is stripped off of each non-quoted field as it is imported
	 * @public
	 * @static
	 * @example
	 * var csv = '"Leno, Jay",10' + "\n" +
	 * '"Conan ""Conando"" O\'Brien",11:35' + "\n" +
	 * '"Fallon, Jimmy",12:35' + "\n";
	 *
	 * var array = CSV.csvToArray(csv);
	 * 
	 * // array is now
	 * // [
	 * // ['Leno, Jay', 10],
	 * // ['Conan "Conando" O\'Brien', '11:35' ],
	 * // ['Fallon, Jimmy', '12:35' ]
	 * // ];
	 */
	function csvToArray(s, trm) {
		// Get rid of any trailing \n
		s = chomp(s);

		var cur = '', // The character we are currently processing.
		inQuote = false,
		fieldQuoted = false,
		field = '', // Buffer for building up the current field
		row = [],
		out = [],
		i,
		processField;

		processField = function (field) {
			if (fieldQuoted !== true) {
				// If field is empty set to null
				if (field === '') {
					field = null;
				// If the field was not quoted and we are trimming fields, trim it
				} else if (trm === true) {
					field = trim(field);
				}

				// Convert unquoted numbers to their appropriate types
				if (rxIsInt.test(field)) {
					field = parseInt(field, 10);
				} else if (rxIsFloat.test(field)) {
					field = parseFloat(field, 10);
				}
			}
			return field;
		};

		for (i = 0; i < s.length; i += 1) {
			cur = s.charAt(i);

			// If we are at a EOF or EOR
			if (inQuote === false && (cur === ',' || cur === "\n")) {
				field = processField(field);
				// Add the current field to the current row
				row.push(field);
				// If this is EOR append row to output and flush row
				if (cur === "\n") {
					out.push(row);
					row = [];
				}
				// Flush the field buffer
				field = '';
				fieldQuoted = false;
			} else {
				// If it's not a ", add it to the field buffer
				if (cur !== '"') {
					field += cur;
				} else {
					if (!inQuote) {
						// We are not in a quote, start a quote
						inQuote = true;
						fieldQuoted = true;
					} else {
						// Next char is ", this is an escaped "
						if (s.charAt(i + 1) === '"') {
							field += '"';
							// Skip the next char
							i += 1;
						} else {
							// It's not escaping, so end quote
							inQuote = false;
						}
					}
				}
			}
		}

		// Add the last field
		field = processField(field);
		row.push(field);
		out.push(row);

		return out;
	}

	return {
		arrayToCsv: arrayToCsv,
		csvToArray: csvToArray
	};
}());


function isString(o) {
	return Object.prototype.toString.apply(o) === '[object String]';
}

function sanitize_input(d) {
	var rxIsNum = /^\d+$|^\.\d+$|^\d\.\d*$/;
	if(isString(d)) {
		// quote numbers that are strings
		if(rxIsNum.test(d)) {
			d = '"' + d + '"';
		} else {
			// escape < and > to avoid XSS
			d = d.replace(/</g, '&lt;');
			d = d.replace(/>/g, '&gt;');
		}
	// convert nulls to '*null*'
	} else if(d === null) {
		d = '*null*';
	}
	return d;
}

function addchars(count, xchar) {
	var i, out = '';
	for(i = 0; i < count; i++)
	  {
		out += xchar;
	  }
	return out;
}

function csvtotable() {
	var i, j, row, out = '',
	cell = '',
	csv = $('#inout').val(), // get the input from the textbox
	arr = CSV.csvToArray(csv); // Convert the csv into an array

	// Each item in the array is a row from the csv
	// walk each row and create table cells for them
	for (i = 0; i < arr.length; i += 1) {
		row = arr[i];
		out += '<tr>';
		for (j = 0; j < row.length; j += 1) {
			cell = sanitize_input(row[j]);
			out += '<td>' + cell + '</td>';
		}
		out += '</tr>';
	}

	// replace the current data with the new imported data
	$('#grid').html(out);
}

function tabletocsv() {
	var i, j, tds, arr = [], csv,
	rxIsInt = /^\d+$/,
	rxIsFloat = /^\d*\.\d+$|^\d+\.\d*$/,
	rxQuotedNumber = /^"\d+"$|"\.\d+"$|^"\d+\.\d*"$/,
	rows = $('#grid tr');

	// Walk the rows of the table and convert them into an array
	rows.each( function() {
		var row = [];
		tds = $(this).find('td');
		tds.each( function () {
			var itm = $(this).text();
			// Since everything in the table was conveted to text when inserted
			// we have to convert it back to a number here before we pass it to 
			// arrayToCsv so it handles them correctly.
			if(rxIsInt.test(itm)) {
				itm = parseInt(itm, 10);
			} else if (rxIsFloat.test(itm)) {
				itm = parseFloat(itm, 10);
			// convert '*null*' to null
			} else if (itm === '*null*') {
				itm = null;
			// don't escape quote quoted numbers
			// instead interpret them as strings containg numbers
			} else if (rxQuotedNumber.test(itm)) {
				itm = itm.replace(/"/g, '')
			}
			row.push(itm);
		});
		arr.push(row);
	});

	// Convert the array to csv
	csv = CSV.arrayToCsv(arr);

	// display the generated csv in the textbox
	$('#inout').val(csv);
}

function csvtomd(){
	var i, j, row, out = '',
	cell = '',
	csv = $('#inout').val(), // get the input from the textbox
	arr = CSV.csvToArray(csv); // Convert the csv into an array
	var celllength = [];
	// Each item in the array is a row from the csv
	// walk each row and create table cells for them
	
	for (i = 0; i < arr.length; i += 1) {
		row = arr[i];
		for (j = 0; j < row.length; j += 1) {
			cell = sanitize_input(row[j]);
			if((celllength[j]<cell.length)||(celllength[j] === undefined))
			  {
				celllength[j] = cell.length;
			  }
		}
	}
	
	for (i = 0; i < arr.length; i += 1) {
		row = arr[i];
		out += '';
		for (j = 0; j < row.length; j += 1) {
			cell = sanitize_input(row[j])+' ';
			if(cell.length-1 < celllength[j])
			  {
				cell += addchars((celllength[j]-cell.length+1), " ");
			  }
			out += cell;
			if(j!=(row.length-1))
			  {
				out += '|';
			  }
		}
		if(i == 0) {
			cell = '';
			for (j = 0; j < celllength.length; j += 1)
			  {
				cell += addchars(celllength[j]+1,'-');
				if(j!=(celllength.length-1))
				  {
					cell += '|';
				  }
			  }
			out += '\n'+cell;
		}
		if(i != arr.length-1)
		  {
  		  out += '\n';
		  }
	}
	
	// replace the current data with the new imported data
	$('#markdownta').val(out);
}

function mdtocsv()
  {
    var markdown = document.getElementById('markdownta').value;
    var markdownlines = markdown.split("\n");
    var markdowncells = new Array();
    var csvout = '';
    var i, j;
    for (i = 0; i < markdownlines.length; i += 1)
      {
        if(i != 1)
          {
            markdowncells = markdownlines[i].split("|");
            for (j = 0; j < markdowncells.length; j += 1)
              {
                csvout += markdowncells[j];
                if(j != markdowncells.length-1)
                  {
                    csvout += ',';
                  }
              }
            if(i != markdownlines.lingth-1)
              {
                csvout += "\n";
              }
          }
      }
    document.getElementById('inout').value = csvout;
  }

function addRow() {
	var i,
			tdCount = $('#grid tr:last>td').length,
			row = '<tr>';
			for (i = 0; i < tdCount; i += 1) {
				row += '<td>*null*</td>';
			}
			row += '</tr>';
	$('#grid tr:last').after(row);
}

function addCol() {
	$('#grid tr').each( function () {
				$(this).append('<td>*null*</td>');
	});
}

$(document).ready( function() {
		// Add click handler to edit cells
		$('#grid td').live('click', function () {
			var newval = prompt('Please enter new value.', $(this).text());
			$(this).text(newval);
		});
});